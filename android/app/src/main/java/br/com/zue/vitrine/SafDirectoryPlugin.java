package br.com.zue.vitrine;

import android.content.ContentResolver;
import android.content.Intent;
import android.content.UriPermission;
import android.database.Cursor;
import android.net.Uri;
import android.provider.DocumentsContract;
import android.provider.OpenableColumns;
import androidx.documentfile.provider.DocumentFile;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Lista pastas do Storage Access Framework (content:// tree URIs).
 * O plugin oficial Filesystem não implementa readdir para content://.
 */
@CapacitorPlugin(name = "SafDirectory")
public class SafDirectoryPlugin extends Plugin {
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void takePersistablePermission(PluginCall call) {
        String path = call.getString("path");
        if (path == null || path.isEmpty()) {
            call.reject("Missing path");
            return;
        }

        Uri uri = Uri.parse(path);
        ContentResolver resolver = getContext().getContentResolver();
        final int flags =
            Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION;

        try {
            resolver.takePersistableUriPermission(uri, flags);
        } catch (SecurityException readWrite) {
            try {
                resolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
            } catch (SecurityException readOnly) {
                call.reject("Não foi possível persistir o acesso à pasta: " + readOnly.getMessage());
                return;
            }
        }

        JSObject result = new JSObject();
        result.put("path", path);
        call.resolve(result);
    }

    @PluginMethod
    public void readdir(PluginCall call) {
        String path = call.getString("path");
        if (path == null || path.isEmpty()) {
            call.reject("Missing path");
            return;
        }

        executor.execute(() -> {
            try {
                DocumentFile dir = resolveDirectory(path);
                if (dir == null || !dir.exists() || !dir.isDirectory()) {
                    call.reject("Pasta inacessível ou inexistente.");
                    return;
                }

                DocumentFile[] children = dir.listFiles();
                JSArray files = new JSArray();

                for (DocumentFile child : children) {
                    String name = child.getName();
                    if (name == null || name.isEmpty()) {
                        continue;
                    }

                    JSObject entry = new JSObject();
                    entry.put("name", name);
                    entry.put("uri", child.getUri().toString());
                    entry.put("type", child.isDirectory() ? "directory" : "file");
                    long mtime = child.lastModified();
                    if (mtime > 0) {
                        entry.put("mtime", mtime);
                    }
                    files.put(entry);
                }

                JSObject result = new JSObject();
                result.put("files", files);
                String displayName = dir.getName();
                if (displayName != null && !displayName.isEmpty()) {
                    result.put("name", displayName);
                }
                call.resolve(result);
            } catch (Exception e) {
                call.reject(e.getMessage() != null ? e.getMessage() : "readdir failed");
            }
        });
    }

    @PluginMethod
    public void getDisplayName(PluginCall call) {
        String path = call.getString("path");
        if (path == null || path.isEmpty()) {
            call.reject("Missing path");
            return;
        }

        executor.execute(() -> {
            try {
                DocumentFile dir = resolveDirectory(path);
                String name = dir != null ? dir.getName() : null;
                if (name == null || name.isEmpty()) {
                    name = queryDisplayName(Uri.parse(path));
                }
                if (name == null || name.isEmpty()) {
                    name = Uri.parse(path).getLastPathSegment();
                }

                JSObject result = new JSObject();
                result.put("name", name != null ? name : path);
                call.resolve(result);
            } catch (Exception e) {
                call.reject(e.getMessage() != null ? e.getMessage() : "getDisplayName failed");
            }
        });
    }

    @PluginMethod
    public void hasPermission(PluginCall call) {
        String path = call.getString("path");
        if (path == null || path.isEmpty()) {
            call.reject("Missing path");
            return;
        }

        Uri target = Uri.parse(path);
        boolean granted = false;
        List<UriPermission> persisted = getContext().getContentResolver().getPersistedUriPermissions();
        for (UriPermission permission : persisted) {
            if (permission.getUri().equals(target) && permission.isReadPermission()) {
                granted = true;
                break;
            }
        }

        JSObject result = new JSObject();
        result.put("granted", granted);
        call.resolve(result);
    }

    private DocumentFile resolveDirectory(String path) {
        Uri uri = Uri.parse(path);
        // Tree URIs (raiz e filhos .../tree/.../document/...) via SAF.
        if (DocumentsContract.isTreeUri(uri)) {
            DocumentFile tree = DocumentFile.fromTreeUri(getContext(), uri);
            if (tree != null) {
                return tree;
            }
        }
        return DocumentFile.fromSingleUri(getContext(), uri);
    }

    private String queryDisplayName(Uri uri) {
        try (
            Cursor cursor = getContext()
                .getContentResolver()
                .query(uri, new String[] { OpenableColumns.DISPLAY_NAME }, null, null, null)
        ) {
            if (cursor != null && cursor.moveToFirst()) {
                int idx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (idx >= 0) {
                    return cursor.getString(idx);
                }
            }
        } catch (Exception ignored) {
            // fall through
        }

        try {
            String docId = DocumentsContract.getTreeDocumentId(uri);
            if (docId != null) {
                int slash = docId.lastIndexOf('/');
                int colon = docId.lastIndexOf(':');
                int cut = Math.max(slash, colon);
                if (cut >= 0 && cut < docId.length() - 1) {
                    return Uri.decode(docId.substring(cut + 1));
                }
            }
        } catch (Exception ignored) {
            // fall through
        }

        return null;
    }
}

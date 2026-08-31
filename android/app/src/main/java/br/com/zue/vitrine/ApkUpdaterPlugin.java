package br.com.zue.vitrine;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "ApkUpdater")
public class ApkUpdaterPlugin extends Plugin {
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void canInstallPackages(PluginCall call) {
        JSObject result = new JSObject();
        result.put("allowed", canRequestInstalls());
        call.resolve(result);
    }

    @PluginMethod
    public void openInstallPermissionSettings(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity unavailable");
            return;
        }

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            JSObject result = new JSObject();
            result.put("allowed", true);
            call.resolve(result);
            return;
        }

        Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
        intent.setData(Uri.parse("package:" + activity.getPackageName()));
        startActivityForResult(call, intent, "handleInstallPermissionResult");
    }

    @ActivityCallback
    private void handleInstallPermissionResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }
        JSObject data = new JSObject();
        data.put("allowed", canRequestInstalls());
        call.resolve(data);
    }

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String apkUrl = call.getString("url");
        if (apkUrl == null || apkUrl.isEmpty()) {
            call.reject("Missing APK url");
            return;
        }

        if (!canRequestInstalls()) {
            call.reject("INSTALL_PERMISSION_REQUIRED");
            return;
        }

        executor.execute(() -> {
            File apkFile = null;
            HttpURLConnection connection = null;
            try {
                apkFile = new File(getContext().getCacheDir(), "zue-update.apk");
                if (apkFile.exists() && !apkFile.delete()) {
                    throw new IllegalStateException("Could not clear previous APK");
                }

                connection = openConnection(apkUrl);
                int code = connection.getResponseCode();
                // Follow one redirect manually (GitHub asset URLs often redirect)
                if (code >= 300 && code < 400) {
                    String redirect = connection.getHeaderField("Location");
                    connection.disconnect();
                    if (redirect == null || redirect.isEmpty()) {
                        throw new IllegalStateException("Redirect without Location");
                    }
                    connection = openConnection(redirect);
                    code = connection.getResponseCode();
                }

                if (code < 200 || code >= 300) {
                    throw new IllegalStateException("Download failed with HTTP " + code);
                }

                long total = connection.getContentLengthLong();
                try (InputStream input = connection.getInputStream();
                     FileOutputStream output = new FileOutputStream(apkFile)) {
                    byte[] buffer = new byte[8192];
                    long downloaded = 0;
                    int read;
                    int lastReported = -1;
                    while ((read = input.read(buffer)) != -1) {
                        output.write(buffer, 0, read);
                        downloaded += read;
                        if (total > 0) {
                            int progress = (int) Math.min(100, (downloaded * 100) / total);
                            if (progress != lastReported) {
                                lastReported = progress;
                                JSObject progressData = new JSObject();
                                progressData.put("progress", progress);
                                notifyListeners("downloadProgress", progressData);
                            }
                        }
                    }
                    output.flush();
                }

                if (!apkFile.exists() || apkFile.length() == 0) {
                    throw new IllegalStateException("Downloaded APK is empty");
                }

                final File installFile = apkFile;
                getActivity().runOnUiThread(() -> {
                    try {
                        launchInstaller(installFile);
                        call.resolve();
                    } catch (Exception e) {
                        call.reject("Failed to launch installer: " + e.getMessage(), e);
                    }
                });
            } catch (Exception e) {
                if (apkFile != null && apkFile.exists()) {
                    //noinspection ResultOfMethodCallIgnored
                    apkFile.delete();
                }
                call.reject("Download failed: " + e.getMessage(), e);
            } finally {
                if (connection != null) {
                    connection.disconnect();
                }
            }
        });
    }

    private HttpURLConnection openConnection(String apkUrl) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(apkUrl).openConnection();
        connection.setInstanceFollowRedirects(true);
        connection.setConnectTimeout(20000);
        connection.setReadTimeout(60000);
        connection.setRequestProperty("User-Agent", "Zue-Vitrine-Android");
        connection.setRequestProperty("Accept", "*/*");
        connection.connect();
        return connection;
    }

    private boolean canRequestInstalls() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return true;
        }
        PackageManager pm = getContext().getPackageManager();
        return pm.canRequestPackageInstalls();
    }

    private void launchInstaller(File apkFile) {
        Activity activity = getActivity();
        if (activity == null) {
            throw new IllegalStateException("Activity unavailable");
        }

        Uri uri = FileProvider.getUriForFile(
            activity,
            activity.getPackageName() + ".fileprovider",
            apkFile
        );

        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(uri, "application/vnd.android.package-archive");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        activity.startActivity(intent);
    }
}

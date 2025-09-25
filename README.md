# Zue - Elegância Atemporal

Este projeto é um website de e-commerce e catálogo para a marca de moda feminina **Zue**. Desenvolvido com **React**, **TypeScript** e **Vite**, o projeto foca em uma interface minimalista, elegante e responsiva, utilizando **Tailwind CSS** para estilização.

![](images/demo.png)

## 📋 Sobre o Projeto

O site serve como uma vitrine digital para a marca, permitindo aos clientes:

- Visualizar coleções e lançamentos na página inicial.
- Navegar por um catálogo de produtos com filtros por categoria.
- Conhecer a história e os valores da marca.
- Entrar em contato diretamente via WhatsApp ou E-mail.
- Inscrever-se em uma newsletter para novidades.

## 🚀 Tecnologias Utilizadas

- **[React](https://react.dev/)**: Biblioteca principal para construção da interface.
- **[TypeScript](https://www.typescriptlang.org/)**: Superset do JavaScript para tipagem estática e segurança no código.
- **[Vite](https://vitejs.dev/)**: Build tool rápida para desenvolvimento front-end.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework de utilitários para estilização rápida e consistente.
- **[Lucide React](https://lucide.dev/)**: Biblioteca de ícones leve e moderna.
- **ESLint**: Para padronização e qualidade do código.

## 📦 Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

- [Node.js](https://nodejs.org/en/) (versão 18 ou superior recomendada)
- npm (geralmente vem com o Node.js)

## 🔧 Instalação e Execução

1.  **Clone o repositório** (se ainda não o fez):

    ```bash
    git clone <url-do-seu-repositorio>
    cd zue
    ```

2.  **Instale as dependências**:

    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```
    O terminal mostrará o link local (geralmente `http://localhost:5173/`) para acessar o site.

## 📜 Scripts Disponíveis

No diretório do projeto, você pode rodar:

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Compila a aplicação para produção na pasta `dist`.
- `npm run preview`: Visualiza localmente a versão de produção gerada.
- `npm run lint`: Executa o ESLint para verificar problemas no código.

## 📂 Estrutura do Projeto

A estrutura principal dentro de `src/` está organizada da seguinte forma:

```text
src/
├── components/           # Componentes reutilizáveis da aplicação
│   ├── About.tsx         # Página/Seção "Sobre"
│   ├── Contact.tsx       # Página/Seção de Contato com formulário
│   ├── Footer.tsx        # Rodapé do site
│   ├── Header.tsx        # Menu de navegação responsivo
│   ├── Hero.tsx          # Seção principal da Home (Hero banner)
│   ├── NewsletterPopup.tsx # Modal de inscrição na newsletter
│   ├── ProductCatalog.tsx # Catálogo de produtos com filtros
│   └── WhatsAppButton.tsx # Botão flutuante do WhatsApp
├── App.tsx               # Componente raiz que gerencia a navegação
├── index.css             # Estilos globais e diretivas do Tailwind
├── main.tsx              # Ponto de entrada da aplicação React
└── vite-env.d.ts         # Tipos do Vite
```

## ✨ Funcionalidades Destacadas

- **Integração com WhatsApp**: Botões de ação (CTA) que redirecionam diretamente para uma conversa no WhatsApp com mensagens pré-definidas (ex: consulta de produtos).
- **Formulários Funcionais**: Formulários de contato e newsletter que utilizam `mailto` para enviar dados diretamente via cliente de e-mail do usuário.
- **Design Responsivo**: Adaptado para funcionar perfeitamente em desktops, tablets e dispositivos móveis.
- **Animações Suaves**: Uso de transições CSS para interações de hover e abertura de menus.

## 📄 Licença

Este projeto é de uso privado para a marca Zue.

# 🚀 Guia: Como Hospedar o Duo e Enviar o App (.exe) para sua Namorada

Este guia explica o passo a passo para deixar o servidor do Duo online 24h gratuitamente e gerar o arquivo executável (`.exe`) para o computador da sua namorada.

---

## 1. Hospedar o Servidor Online Gratuitamente (Render.com)

O Render permite hospedar o servidor Node.js/Socket.io do Duo com HTTPS/WSS gratuitamente.

1. Crie uma conta gratuita em [https://render.com](https://render.com).
2. No painel, clique em **New +** $\rightarrow$ **Web Service**.
3. Escolha subir pelo seu GitHub (ou crie um repositório com os arquivos do Duo).
4. Configure os campos:
   - **Name:** `duo-app` (ou o nome que preferir)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run server`
5. Clique em **Create Web Service**.
6. Em 1 minuto, o Render vai gerar a sua URL pública segura, por exemplo:
   ```text
   https://duo-app-xyz.onrender.com
   ```

---

## 2. Configurar a URL no Projeto

Abra o arquivo [`public/duo-config.js`](file:///C:/Users/fabio/.gemini/antigravity/scratch/duo-call/public/duo-config.js) e cole a URL do seu servidor Render:

```javascript
const DUO_CONFIG = {
  SERVER_URL: 'https://duo-app-xyz.onrender.com'
};
```

---

## 3. Gerar o Instalador `.exe` para o PC da sua Namorada

No terminal da pasta do projeto, execute o comando de build:

```bash
npm run build:installer
```
*(ou se preferir um `.exe` portátil que não precisa nem instalar: `npm run build:win`)*

Quando terminar, uma pasta chamada `dist/` será criada contendo:
- **`Duo Setup 1.0.0.exe`** (Instalador com atalho na Área de Trabalho)
- **`Duo 1.0.0.exe`** (Versão portátil de 1 clique)

---

## 4. Enviando para ela

1. Envie o arquivo `Duo Setup 1.0.0.exe` para ela (via Google Drive, WeTransfer, WhatsApp ou Discord).
2. Quando ela der dois cliques no arquivo no computador dela:
   - O Duo instala automaticamente e cria o ícone **Duo** na Área de Trabalho dela.
   - Sempre que ela abrir o app, vai conectar direto com você na chamada!

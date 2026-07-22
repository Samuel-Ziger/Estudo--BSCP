# Cache//Lab — BSCP Training System

Plataforma local e modular para estudar Web Cache Deception com o Burp Suite. O primeiro módulo contém 8 trilhas e 40 mini labs progressivos.

## Executar

Requer Node.js 18 ou superior e não precisa instalar dependências:

```bash
npm start
```

Abra `http://127.0.0.1:3000` no navegador. Para treinar com o Burp, configure o navegador para passar pelo proxy e use as rotas exibidas em cada lab.

Cada lab possui uma sessão de vítima simulada:

```http
Cookie: session=victim
```

Envie primeiro a URL com esse cookie para armazenar os dados; depois repita a mesma URL sem o cookie. O simulador registra a conclusão automaticamente. Os desafios são locais e seguros: não fazem chamadas externas nem atacam terceiros.

## Organização

- `Webcache.txt` — material integral fornecido para referência.
- `server.js` — API, cache simulado, endpoints vulneráveis e validação.
- `public/index.html` — interface da academia.
- `public/styles.css` — identidade visual responsiva.
- `public/app.js` — navegação, progresso, teoria, labs e caderno.

Para adicionar um novo módulo, crie um novo conjunto de trilhas no array `tracks`, acrescente a definição de lab em `labFor` e mantenha a interface consumindo `/api/course`.

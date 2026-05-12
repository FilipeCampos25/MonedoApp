##  Instalação e execução do projeto

Após clonar o repositório, execute os comandos abaixo:

### 1. Instalar as dependências

```bash
npm install
```

### 2. Instalar dependências do Expo/Babel

```bash
npm install babel-preset-expo --save-dev
npx expo install react-native-reanimated
```

### 3. Limpar cache do Expo

```bash
npx expo start -c
```

---

##  Reinstalação completa das dependências (caso ocorra erro)

Se houver problemas relacionados a módulos faltando ou erros de bundling, execute:

### Git Bash

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### PowerShell (Windows)

```powershell
rmdir /s /q node_modules
del package-lock.json
npm install
```

Depois execute novamente:

```bash
npx expo start -c
```
# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a MEMORIZE! Este documento te guiará a través del proceso.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código.

### Nuestros Estándares

- Usa un lenguaje acogedor e inclusivo
- Respeta los diferentes puntos de vista y experiencias
- Acepta críticas constructivas con gracia
- Enfócate en lo que es mejor para la comunidad

## 🎯 ¿Cómo puedo contribuir?

### Reportar Bugs

Si encuentras un bug:

1. **Verifica** que no haya sido reportado antes
2. **Crea un issue** con:
   - Título descriptivo
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si es posible
   - Información del sistema (OS, navegador, versión)

### Sugerir Mejoras

Para sugerir nuevas características:

1. **Verifica** que no exista una sugerencia similar
2. **Crea un issue** explicando:
   - El problema que resuelve
   - Cómo debería funcionar
   - Alternativas consideradas

### Contribuir con Código

1. **Fork** el repositorio
2. **Crea una rama** desde `main`
3. **Implementa** tus cambios
4. **Prueba** tu código
5. **Envía** un Pull Request

## 🔄 Proceso de Desarrollo

### 1. Configurar el Entorno

```bash
# Clonar tu fork
git clone https://github.com/tu-usuario/memorize.git
cd memorize

# Agregar upstream
git remote add upstream https://github.com/original/memorize.git

# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install
```

### 2. Crear una Rama

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear rama feature
git checkout -b feature/nombre-descriptivo

# O rama bugfix
git checkout -b fix/descripcion-del-bug
```

### 3. Hacer Cambios

- Escribe código limpio y legible
- Sigue los estándares del proyecto
- Comenta código complejo
- Actualiza documentación si es necesario

### 4. Probar

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Verificar que todo funcione correctamente
```

### 5. Commit

```bash
git add .
git commit -m "tipo: descripción breve"
```

### 6. Push y Pull Request

```bash
git push origin feature/nombre-descriptivo
```

Luego crea un Pull Request en GitHub.

## 📝 Estándares de Código

### TypeScript

- Usa **TypeScript** para todo el código nuevo
- Define tipos e interfaces explícitamente
- Evita `any` cuando sea posible

```typescript
// ✅ Bueno
interface User {
  id: string;
  email: string;
  role: 'player' | 'admin';
}

// ❌ Malo
const user: any = { ... };
```

### React

- Usa **componentes funcionales** con hooks
- Nombra componentes en **PascalCase**
- Usa **props destructuring**

```typescript
// ✅ Bueno
export function GameCard({ title, score, onClick }: GameCardProps) {
  return <div onClick={onClick}>{title}: {score}</div>;
}

// ❌ Malo
export function gamecard(props) {
  return <div onClick={props.onClick}>{props.title}</div>;
}
```

### Estilos

- Usa **Tailwind CSS** para estilos
- Mantén clases ordenadas
- Usa **Framer Motion** para animaciones

```typescript
// ✅ Bueno
<div className="flex items-center justify-center p-4 bg-gray-800 rounded-lg">

// ❌ Malo
<div style={{ display: 'flex', padding: '16px' }}>
```

### Nombres de Variables

- **camelCase** para variables y funciones
- **PascalCase** para componentes y tipos
- **UPPER_SNAKE_CASE** para constantes

```typescript
// ✅ Bueno
const userName = 'Kevin';
const MAX_PLAYERS = 4;
interface UserProfile { ... }

// ❌ Malo
const UserName = 'Kevin';
const maxplayers = 4;
```

## 💬 Commits

Usa el formato de **Conventional Commits**:

```
tipo(scope): descripción breve

[cuerpo opcional]

[footer opcional]
```

### Tipos

- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, punto y coma, etc
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### Ejemplos

```bash
feat(game): agregar modo infinito
fix(auth): corregir validación de email
docs(readme): actualizar instrucciones de instalación
style(card): mejorar espaciado de componentes
refactor(api): simplificar endpoints de usuario
```

## 🔍 Pull Requests

### Checklist

Antes de enviar un PR, verifica:

- [ ] El código compila sin errores
- [ ] Los tests pasan (si existen)
- [ ] La documentación está actualizada
- [ ] El código sigue los estándares del proyecto
- [ ] Los commits siguen el formato convencional
- [ ] No hay conflictos con `main`

### Descripción del PR

Incluye:

1. **Qué** cambia este PR
2. **Por qué** es necesario
3. **Cómo** se probó
4. **Screenshots** (si aplica)

### Ejemplo

```markdown
## Descripción
Agrega el modo de juego infinito donde los jugadores pueden jugar sin límite de niveles.

## Motivación
Los usuarios solicitaron un modo sin restricciones para practicar.

## Cambios
- Nuevo componente `InfiniteMode.tsx`
- Endpoint `/api/matches/infinite`
- Actualización de `App.tsx` para incluir el nuevo modo

## Pruebas
- Probado en Chrome, Firefox y Safari
- Verificado que las puntuaciones se guarden correctamente
- Comprobado que no afecta otros modos de juego

## Screenshots
![Modo Infinito](./screenshots/infinite-mode.png)
```

## 🐛 Debugging

### Backend

```bash
# Ver logs en tiempo real
cd backend
npm run dev

# Abrir Prisma Studio
npx prisma studio
```

### Frontend

```bash
# Modo desarrollo con hot reload
cd frontend
npm run dev

# Abrir DevTools del navegador
# F12 o Ctrl+Shift+I
```

## 📚 Recursos

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Framer Motion](https://www.framer.com/motion/)

## ❓ Preguntas

Si tienes preguntas:

1. Revisa la documentación existente
2. Busca en issues cerrados
3. Crea un nuevo issue con la etiqueta `question`

## 🎉 ¡Gracias!

Tu contribución hace que MEMORIZE sea mejor para todos. ¡Gracias por tu tiempo y esfuerzo!

---

**¿Listo para contribuir?** [Crea tu primer Pull Request](https://github.com/tu-usuario/memorize/pulls)

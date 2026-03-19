# Relajate.com - Tu Pausa Digital

**ES:** Relajate.com es una plataforma web de bienestar digital que ofrece juegos interactivos, ejercicios de respiración guiados y un micro diario personal. Todo diseñado para ayudarte a tomar una pausa consciente cada día.

**EN:** Relajate.com is a digital wellness web platform offering interactive games, guided breathing exercises, and a personal micro journal. Everything is designed to help you take a mindful pause every day.

---

## Funciones / Features

### Juegos Rápidos / Quick Games
- **Conecta Palabras**: Encuentra 4 grupos de 4 palabras relacionadas (30+ puzzles diarios)
- **Flujo de Colores**: Puzzle de colores relajante con mecánica de gravedad
- **Patrón Zen**: Juego de memoria de patrones con dificultad progresiva

### Ejercicios de Respiración / Breathing Exercises
- **Respiración 4-7-8**: Técnica para reducir la ansiedad con animación circular
- **Respiración Cuadrada**: Box breathing con guía visual animada
- **Respiración Consciente**: Sesión libre con partículas ambientales y temporizador

### Micro Diario / Micro Journal
- Prompts diarios en español (35+ prompts)
- Reflexiones de 280 caracteres
- Selector de estado de ánimo
- Gratitud rápida con un toque
- Vista de calendario con historial
- Exportación de entradas

### Comunidad / Community
- Desafíos diarios
- Tabla de rachas
- Sección para compartir momentos zen
- Suscripción a newsletter

---

## Tecnología / Tech Stack

- HTML5, CSS3, JavaScript (vanilla)
- PWA con Service Worker para uso offline
- localStorage para persistencia de datos
- Diseño responsive mobile-first
- Soporte para modo oscuro
- Google Fonts: Nunito + Inter

---

## Instalación / Setup

1. Clona o descarga el proyecto
2. Abre `index.html` en tu navegador, o sirve con cualquier servidor estático:

```bash
# Con Python
python -m http.server 8000

# Con Node.js (npx)
npx serve .

# Con VS Code
# Instala la extensión "Live Server" y haz clic en "Go Live"
```

3. Navega a `http://localhost:8000`

---

## Estructura / Structure

```
mediakit-website/
├── index.html        # Página principal
├── games.html        # Juegos interactivos
├── breathing.html    # Ejercicios de respiración
├── journal.html      # Micro diario
├── community.html    # Comunidad
├── styles.css        # Estilos compartidos
├── sw.js             # Service Worker (PWA)
├── manifest.json     # PWA Manifest
└── README.md         # Este archivo
```

---

## Licencia / License

Este proyecto es de código abierto. Úsalo libremente para tu bienestar.

This project is open source. Use it freely for your wellbeing.

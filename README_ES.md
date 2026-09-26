# 🎮 菠萝战纪 (Brawlore) - Manual del Juego en Español

¡Bienvenido al manual oficial en español de **Brawlore** (菠萝战纪)! Este es un juego de Rol de Acción (ARPG) en 2D desarrollado con HTML5 Canvas y JavaScript nativo, rindiendo homenaje al clásico e legendario *Diablo II*. 

El juego se ejecuta directamente en tu navegador y cuenta con soporte multilingüe completo (Español por defecto, Inglés y Chino), sistema de guardado local automático (IndexedDB), cooperativo y chat mundial, modo offline, recompensas diarias y mucho más.

---

## 🚀 Características Principales

### 🗺️ Exploración y Mazmorras
- **Mazmorras Aleatorias**: Cada nivel de la mazmorra se genera dinámicamente con muros, enemigos, cofres, fuentes y altares aleatorios. No hay dos incursiones iguales.
- **Campamento de las Arpías**: La zona segura clásica donde podrás hablar con comerciantes, curarte, gestionar tu alijo personal de objetos y aceptar misiones críticas.
- **Puntos de Ruta (Waypoints)**: Viaja de forma instantánea entre los pisos que ya hayas descubierto y activado.

### ⚔️ Combate en Tiempo Real y Habilidades
- **Sistema de Combate Fluido**: Ataca cuerpo a cuerpo con tu arma o desata hechizos devastadores a distancia.
- **4 Ramas de Habilidades Activas y Evolutivas**:
  - 🔥 **Rama de Fuego (Q)**: Lanza bolas de fuego destructivas que evolucionan para causar daño en área (AOE) con explosiones masivas y efectos de quemadura.
  - ⚡ **Rama de Rayo (W)**: Invoca poderosos relámpagos que se convierten en cadenas de rayos que saltan de enemigo a enemigo.
  - 🏹 **Rama de Disparo (E)**: Dispara ráfagas de flechas múltiples para abatir a hordas enteras a distancia.
  - 🛡️ **Rama de Escudo Sagrado (R)**: Aumenta tu defensa enormemente, refleja daño a los atacantes y proporciona mitigación de daño absoluta.
- **Evolución de Habilidades**: Cada habilidad cuenta con 3 fases de evolución (Básico → Bifurcación → Última forma) hasta nivel 15, permitiéndote personalizar totalmente tu build.

### 🛡️ Sistema de Equipamiento y Objetos (Loot)
- **Calidad de Objetos**: Común (Blanco), Mágico (Azul), Raro (Amarillo), Único (Dorado) y de Conjunto (Verde).
- **10 Sets de Conjunto Clásicos (60 piezas en total)**:
  - 🟢 **Ropajes de Tal Rasha**: Potencia el maná y el daño de fuego.
  - 🟢 **Rey Inmortal**: Fuerza bruta pura y enorme daño físico.
  - 🟢 **Bailarina de las Sombras**: Velocidad de ataque y daño crítico extremos.
  - 🟢 **Venganza de Natalya**: Bonificaciones masivas a flechas y rayos.
  - 🟢 **Legado de Griswold**: Defensa inquebrantable y gran regeneración.
  - ¡Y muchos más como *Trang-Oul*, *Aldur*, *Sigon* y el set exclusivo de recompensas del *Abismo*!
- **Runas y Palabras Rúnicas (Runewords)**: Engarza runas míticas (como El, Eld, Tir, Nef, Eth, Ith, Tal, Ral, Ort, Thul, Amn, Sol, Shael, Dol...) en equipos con huecos para desbloquear propiedades legendarias y Palabras Rúnicas con atributos masivos.
- **Forja y Herrería (Charsi)**: Sube el nivel de tus armas y armaduras favoritas hasta +9 ofreciendo otros equipos redundantes de la misma rareza y tipo como sacrificio.

### 🤖 Batalla Automática Inteligente
- Presiona la tecla **F** para activar el sistema de combate automático.
- **Navegación Intuitiva**: El héroe esquiva obstáculos, busca enemigos cercanos, utiliza pociones de vida/maná automáticamente según umbrales de salud, y recoge oro y equipamiento valioso del suelo.
- **Tácticas Personalizadas**: Ajusta la distancia de seguridad que prefieras mantener con los enemigos, la prioridad del uso de tus habilidades y las reglas de recogida automática de botín en el menú de ajustes.

### 📅 Progresión, Desafíos y Recompensas
- **10 Misiones de Campaña**: Desde despejar la "Guarida del Mal" hasta asaltar el "Fuerte de la Piedra del Mundo".
- **Modo Infierno**: Al derrotar a Baal en el piso 10, podrás desbloquear el Modo Infierno. Los monstruos tendrán el séxtuple de vida, infligirán daño multiplicado por 4, pero la probabilidad de encontrar objetos de conjunto y únicos aumentará un 350%. ¡Cuidado, tus resistencias iniciales sufrirán una penalización de -100%!
- **El Abismo**: Una mazmorra infinita pensada para el final del juego, donde te enfrentarás a oleadas de monstruos ultra-poderosos con recompensas rúnicas y de conjunto exclusivas.
- **Logros y Trofeos**: 8 logros integrados con seguimiento en tiempo real y recompensas sonoras especiales al desbloquearlos.
- **Recompensas Fuera de Línea (Offline)**: ¿No tienes tiempo para jugar? Tu héroe seguirá recolectando oro y equipo de forma pasiva mientras estás desconectado (hasta un máximo de 8 horas según tu piso de récord despejado).

---

## 🕹️ Guía de Controles del Juego

### ⌨️ Atajos de Teclado (Recomendado para PC)
- `Q` - Lanza Bola de Fuego (Rama de Fuego)
- `W` - Invoca Rayo / Cadena de Rayos (Rama de Rayo)
- `E` - Lanza Disparo Múltiple (Rama de Disparo)
- `R` - Activa Escudo Sagrado (Rama de Escudo)
- `F` - Activa / Desactiva la Batalla Automática (Auto-battle)
- `1` - Consume Poción de Vida (Espacio rápido 1 de la correa)
- `2` - Consume Poción de Maná (Espacio rápido 2 de la correa)
- `3` - Utiliza un Pergamino de Portal de la Ciudad (Espacio rápido 3 de la correa)
- `C` - Abre / Cierra el Panel de Atributos del Personaje (Fuerza, Destreza, Vitalidad, Energía)
- `I` o `B` - Abre / Cierra la Mochila (Inventario)
- `T` - Abre / Cierra el Árbol de Habilidades y Evoluciones
- `J` - Abre / Cierra el Registro de Misiones
- `A` - Abre / Cierra el Panel de Logros obtenidos
- `Enter` - Interactuar con portales, bajadas de piso, puntos de ruta o cofres cercanos.
- `Alt` - Muestra/oculta las etiquetas de los objetos tirados en el suelo para recogerlos fácilmente haciendo clic en ellas.

### 🖱️ Acciones del Ratón / Touchpad
- **Clic Izquierdo en el Suelo**: Mueve al personaje al punto indicado.
- **Clic Izquierdo en un Enemigo**: Ataca físicamente con tu arma (mantenlo presionado para continuar atacando de forma fluida).
- **Clic Izquierdo en un Objeto del Suelo**: Camina automáticamente hacia el objeto y lo recoge.
- **Clic Izquierdo en un NPC (Gheed, Akara, Warriv, Sabio, Guardián)**: Inicia el diálogo, abre misiones, cura heridas o abre paneles especiales (Tienda, Alijo, Forja, 洗点/Reset).
- **Clic Izquierdo en un Objeto del Inventario**: Equipa el arma o armadura, o consume la poción seleccionada. Si el cofre de Warriv está abierto, transfiere automáticamente el objeto al alijo de forma instantánea.
- **Clic Derecho en un Objeto del Inventario**: Tira el objeto al suelo de la mazmorra (deshabilitado en el campamento para evitar pérdidas accidentales).

---

## 🛠️ Cómo Iniciar y Jugar en Local

Este juego está completamente optimizado para ejecutarse como una aplicación estática de manera ultra rápida, sin necesidad de compilaciones pesadas o frameworks complejos.

### Opción A: Abrir directamente en navegador (Recomendado)
Simplemente haz doble clic en el archivo `index.html` en tu computadora para empezar a jugar al instante. Las partidas se guardarán automáticamente en tu navegador usando **IndexedDB**.

### Opción B: Iniciar servidor de desarrollo en Node.js
Si prefieres ejecutar el juego mediante un servidor HTTP local para evitar restricciones de CORS del navegador al cargar ciertas fuentes o activos multimedia:
1. Asegúrate de tener instalado [Node.js](https://nodejs.org/).
2. Abre la terminal en el directorio raíz del juego.
3. Ejecuta los siguientes comandos:
   ```bash
   # Instalar dependencias del servidor
   npm install
   
   # Iniciar el juego localmente
   npm run dev
   ```
4. Abre tu navegador favorito y accede a: [http://localhost:3000](http://localhost:3000)

---

## 📱 Experiencia de Usuario y Diseño Móvil

El juego se ha diseñado bajo una filosofía **Mobile-First** con las siguientes mejoras táctiles:
1. **PWA (Progressive Web App)**: El juego cuenta con soporte para ser instalado como una App nativa en tu teléfono Android o iPhone. Solo abre el enlace en tu navegador móvil, presiona "Añadir a la pantalla de inicio" y juega sin barra de direcciones, a pantalla completa y de forma offline.
2. **Controles Táctiles Adaptados**: Cuenta con un panel flotante de botones virtuales para que puedas moverte, atacar, usar habilidades, consumir pociones de tu correa y activar la batalla automática cómodamente con los pulgares.
3. **Optimización de Interacción**: Al acercarte a un cofre, un NPC, un portal o un waypoint, aparecerá un botón flotante dinámico de interacción que te permitirá activar o usar el objeto directamente con un solo toque, sin necesidad de pulsar con precisión quirúrgica en pantallas táctiles pequeñas.

¡Disfruta de la experiencia ARPG definitiva directamente desde tu navegador! ⚔️🛡️🔥

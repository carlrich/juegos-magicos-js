let selectedColor = null;
let currentLevel = 1;
const maxLevels = 3;

const drawings = {
  1: `
    <svg width="250" height="250" viewBox="0 0 300 300">
      <circle id="cara" cx="150" cy="150" r="90" fill="white" stroke="black" stroke-width="4"/>
      <circle id="oreja1" cx="90" cy="80" r="30" fill="white" stroke="black" stroke-width="4"/>
      <circle id="oreja2" cx="210" cy="80" r="30" fill="white" stroke="black" stroke-width="4"/>

      <circle id="ojo1" cx="120" cy="140" r="12" fill="white" stroke="black" stroke-width="3"/>
      <circle id="ojo2" cx="180" cy="140" r="12" fill="white" stroke="black" stroke-width="3"/>

      <ellipse id="hocico" cx="150" cy="180" rx="35" ry="25" fill="white" stroke="black" stroke-width="3"/>
      <circle id="nariz" cx="150" cy="175" r="8" fill="white" stroke="black" stroke-width="3"/>

      <path id="boca" d="M130 190 Q150 205 170 190" fill="white" stroke="black" stroke-width="4"/>
    </svg>
  `,
  2: `
    <svg width="250" height="250" viewBox="0 0 300 300">
      <circle id="centro" cx="150" cy="150" r="30" fill="white" stroke="black" stroke-width="4"/>
      
      <circle id="p1" cx="150" cy="70" r="40" fill="white" stroke="black" stroke-width="4"/>
      <circle id="p2" cx="220" cy="110" r="40" fill="white" stroke="black" stroke-width="4"/>
      <circle id="p3" cx="220" cy="190" r="40" fill="white" stroke="black" stroke-width="4"/>
      <circle id="p4" cx="150" cy="230" r="40" fill="white" stroke="black" stroke-width="4"/>
      <circle id="p5" cx="80" cy="190" r="40" fill="white" stroke="black" stroke-width="4"/>
      <circle id="p6" cx="80" cy="110" r="40" fill="white" stroke="black" stroke-width="4"/>
    </svg>
  `,
  3: `
    <svg width="260" height="260" viewBox="0 0 300 300">
      <rect id="paredes" x="70" y="120" width="160" height="140" fill="white" stroke="black" stroke-width="4"/>
      <polygon id="techo" points="50,120 150,40 250,120" fill="white" stroke="black" stroke-width="4"/>

      <rect id="puerta" x="135" y="180" width="40" height="80" fill="white" stroke="black" stroke-width="4"/>
      <circle id="manija" cx="165" cy="220" r="6" fill="white" stroke="black" stroke-width="3"/>

      <rect id="ventana1" x="90" y="140" width="40" height="40" fill="white" stroke="black" stroke-width="3"/>
      <rect id="ventana2" x="170" y="140" width="40" height="40" fill="white" stroke="black" stroke-width="3"/>
    </svg>
  `
};

function loadLevel() {
  const container = document.getElementById("drawingContainer");
  if (!container) return;

  container.innerHTML = drawings[currentLevel];

  const svg = container.querySelector("svg");
  if (!svg) return;

  svg.querySelectorAll("*").forEach(part => {
    // ensure element is clickable and shows pointer
    if (part instanceof SVGElement) {
      part.style.cursor = "pointer";
      part.addEventListener("click", () => {
        if (selectedColor) {
          part.setAttribute("fill", selectedColor);
          checkCompletion(svg);
        }
      });
    }
  });
}

function checkCompletion(svg) {
  const allPainted = [...svg.querySelectorAll("*")].every(el => el.getAttribute("fill") !== "white");

  if (allPainted) {
    Swal.fire({
      title: "¡Muy bien! 🎨",
      text: "Has terminado este dibujo.",
      icon: "success",
      confirmButtonText: "Siguiente nivel"
    }).then(() => {
      currentLevel++;
      if (currentLevel > maxLevels) {
        Swal.fire({
          title: "¡Juego completado! 🎉",
          text: "Has coloreado todos los dibujos.",
          icon: "success",
          confirmButtonText: "Volver al menú"
        }).then(() => {
          // Reiniciar al primer nivel o volver al menú según la lógica de la app
          currentLevel = 1;
          loadLevel();
        });
      } else {
        loadLevel();
      }
    });
  }
}

// Selección de color
document.querySelectorAll("#palette div").forEach(btn => {
  btn.addEventListener("click", () => {
    const color = window.getComputedStyle(btn).backgroundColor || btn.style.backgroundColor;
    if (color) {
      selectedColor = color;
      // marcar visualmente el botón seleccionado
      document.querySelectorAll("#palette div").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    }
  });
});

loadLevel();

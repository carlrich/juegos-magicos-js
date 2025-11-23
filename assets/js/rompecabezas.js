const filas = 3;
const columnas = 3;

const puzzleContainer = document.getElementById("puzzle");

// Niveles: primero osito.svg, luego los otros 4 en orden aleatorio
const otherLevels = ["dibujos/flor.svg", "dibujos/casita.svg", "dibujos/carita.svg", "dibujos/auto.svg"];
shuffleArray(otherLevels);
const niveles = ["dibujos/osito.svg", ...otherLevels];

let nivelActual = 0;

cargarNivel(nivelActual);

function cargarNivel(index) {
  const ruta = niveles[index];
  fetch(ruta)
    .then(res => res.text())
    .then(svgTexto => iniciarRompecabezas(svgTexto));
}

function iniciarRompecabezas(svgTexto) {
  const img = new Image();
  const svg64 = btoa(unescape(encodeURIComponent(svgTexto)));
  img.src = "data:image/svg+xml;base64," + svg64;

  img.onload = () => {
    // 1. Definimos un tamaño fijo de buena calidad para el rompecabezas.
    // Esto evita problemas si el SVG original es muy pequeño o no tiene medidas.
    const puzzleWidth = 600; 
    const puzzleHeight = 600; 

    // 2. Creamos un "Canvas Maestro" temporal.
    // Aquí dibujaremos la imagen completa estirándola para que ocupe todo el espacio.
    const mainCanvas = document.createElement("canvas");
    const mainCtx = mainCanvas.getContext("2d");
    mainCanvas.width = puzzleWidth;
    mainCanvas.height = puzzleHeight;

    // Dibujamos la imagen (img) llenando forzosamente el canvas maestro (0,0 a 600,600)
    mainCtx.drawImage(img, 0, 0, puzzleWidth, puzzleHeight);

    // 3. Calculamos el tamaño de cada pieza basándonos en el Canvas Maestro
    const piezaAncho = puzzleWidth / columnas;
    const piezaAlto = puzzleHeight / filas;

    let piezas = [];

    for (let fila = 0; fila < filas; fila++) {
      for (let col = 0; col < columnas; col++) {
        
        // Canvas para la pieza individual
        const pieceCanvas = document.createElement("canvas");
        const pieceCtx = pieceCanvas.getContext("2d");
        
        pieceCanvas.width = piezaAncho;
        pieceCanvas.height = piezaAlto;

        // CORTAMOS del Canvas Maestro (que ya tiene la imagen bien renderizada)
        pieceCtx.drawImage(
          mainCanvas,         // Fuente: el canvas completo
          col * piezaAncho, fila * piezaAlto, // Dónde empezar a cortar (x, y)
          piezaAncho, piezaAlto,              // Tamaño del corte
          0, 0,                               // Dónde pegar en la pieza
          piezaAncho, piezaAlto               // Tamaño en la pieza
        );

        let pieza = document.createElement("img");
        pieza.className = "border border-gray-400 rounded-lg cursor-pointer active:scale-95 transition";
        pieza.style.width = "100%";
        pieza.style.height = "100%";
        pieza.style.objectFit = "cover"; // Asegura que se vea bien
        
        pieza.src = pieceCanvas.toDataURL(); // Convertimos la pieza a imagen

        pieza.draggable = true;
        pieza.dataset.correcta = `${fila}-${col}`;

        piezas.push(pieza);
      }
    }

    // Mezclar piezas
    piezas.sort(() => Math.random() - 0.5);

    // Configurar el contenedor
    puzzleContainer.innerHTML = "";
    puzzleContainer.style.display = "grid";
    puzzleContainer.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;
    puzzleContainer.style.gap = "8px";
    
    // Opcional: Limitar el ancho máximo para que no se vea gigante en pantalla
    puzzleContainer.style.maxWidth = "500px"; 
    puzzleContainer.style.margin = "0 auto"; // Centrar

    piezas.forEach(p => puzzleContainer.appendChild(p));

    activarDragAndDrop();
  };
}

function activarDragAndDrop() {
  const piezas = document.querySelectorAll("#puzzle img");

  piezas.forEach(p => {
    p.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", `${e.target.dataset.correcta}|${e.target.src}`);
      e.dataTransfer.effectAllowed = "move";
      e.target.classList.add("opacity-50");
    });

    p.addEventListener("dragend", e => {
      e.target.classList.remove("opacity-50");
    });

    p.addEventListener("dragover", e => e.preventDefault());

    p.addEventListener("drop", e => {
      e.preventDefault();

      const data = e.dataTransfer.getData("text/plain");
      const [correctaDrag, srcDrag] = data.split("|");

      // pieza sobre la que se suelta
      const correctaDrop = e.target.dataset.correcta;
      const srcDrop = e.target.src;

      // Buscar la pieza arrastrada ANTES de modificar la pieza destino
      const draggedPiece = [...piezas].find(p => p.src === srcDrag);
      if (!draggedPiece) return;

      // Intercambio visual
      e.target.src = srcDrag;
      e.target.dataset.correcta = correctaDrag;

      draggedPiece.src = srcDrop;
      draggedPiece.dataset.correcta = correctaDrop;

      verificarSiTermino();
    });
  });
}

function verificarSiTermino() {
  const piezas = document.querySelectorAll("#puzzle img");
  for (let i = 0; i < piezas.length; i++) {
    const p = piezas[i];
    const expected = `${Math.floor(i / columnas)}-${i % columnas}`;
    if (p.dataset.correcta !== expected) return;
  }

  Swal.fire({
    title: "¡Felicidades! 🎉",
    text: "Completaste el rompecabezas",
    icon: "success",
    confirmButtonText: "Seguir jugando"
  }).then(result => {
    if (result.isConfirmed) {
      // Avanzar al siguiente nivel (envuelve al inicio cuando termina la lista)
      nivelActual = (nivelActual + 1) % niveles.length;
      cargarNivel(nivelActual);
    }
  });
}

// Utilidades
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const convertBtn = document.getElementById("convertBtn");
const progressBar = document.getElementById("progressBar");
const themeBtn = document.getElementById("themeBtn");
const dropArea = document.getElementById("dropArea");

let images = [];

input.addEventListener("change", (e) => {
  addImages(e.target.files);
});

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  addImages(e.dataTransfer.files);
});

function addImages(files) {
  images.push(...Array.from(files));
  renderImages();
}

function renderImages() {
  preview.innerHTML = "";

  images.forEach((file, index) => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    const actions = document.createElement("div");
    actions.className = "actions";

    const leftBtn = document.createElement("button");
    leftBtn.innerText = "⬅";

    const rightBtn = document.createElement("button");
    rightBtn.innerText = "➡";

    const removeBtn = document.createElement("button");
    removeBtn.innerText = "❌";

    leftBtn.onclick = () => moveLeft(index);
    rightBtn.onclick = () => moveRight(index);
    removeBtn.onclick = () => removeImage(index);

    actions.append(
      leftBtn,
      removeBtn,
      rightBtn
    );

    card.append(img, actions);
    preview.appendChild(card);
  });
}

function removeImage(index) {
  images.splice(index, 1);
  renderImages();
}

function moveLeft(index) {
  if (index === 0) return;

  [images[index], images[index - 1]] =
    [images[index - 1], images[index]];

  renderImages();
}

function moveRight(index) {
  if (index === images.length - 1)
    return;

  [images[index], images[index + 1]] =
    [images[index + 1], images[index]];

  renderImages();
}

themeBtn.onclick = () => {
  document.body.classList.toggle("dark");
};

convertBtn.onclick = createPdf;

async function createPdf() {
  if (!images.length) {
    alert("Select images first.");
    return;
  }

  progressBar.style.width = "0%";

  const pdfDoc =
    await PDFLib.PDFDocument.create();

  for (let i = 0; i < images.length; i++) {
    const file = images[i];

    const bytes =
      await file.arrayBuffer();

    let image;

    if (file.type === "image/png") {
      image =
        await pdfDoc.embedPng(bytes);
    } else {
      image =
        await pdfDoc.embedJpg(bytes);
    }

    const { width, height } =
      image.scale(1);

    const page =
      pdfDoc.addPage([width, height]);

    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height
    });

    const progress =
      ((i + 1) / images.length) * 100;

    progressBar.style.width =
      progress + "%";
  }

  const pdfBytes =
    await pdfDoc.save();

  const blob = new Blob(
    [pdfBytes],
    {
      type: "application/pdf"
    }
  );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;
  a.download = "images.pdf";
  a.click();

  URL.revokeObjectURL(url);

  setTimeout(() => {
    progressBar.style.width = "0%";
  }, 1000);
}



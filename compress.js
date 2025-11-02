let selectedFiles = [];

document.addEventListener("DOMContentLoaded", function () {
    const uploadBox = document.getElementById("uploadBox");
    const fileInput = document.getElementById("fileInput");
    const previewContainer = document.getElementById("previewArea");
    const compressAllBtn = document.getElementById("compressAll");

    // When clicking upload area → trigger file picker
    uploadBox.addEventListener("click", () => fileInput.click());

    // Handle drag & drop
    uploadBox.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadBox.classList.add("dragging");
    });

    uploadBox.addEventListener("dragleave", () => {
        uploadBox.classList.remove("dragging");
    });

    uploadBox.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadBox.classList.remove("dragging");
        handleFiles(e.dataTransfer.files);
    });

    // When browsing with file picker
    fileInput.addEventListener("change", function () {
        handleFiles(fileInput.files);
    });

    function handleFiles(files) {
        [...files].forEach(file => {
            selectedFiles.push({ file, compressed: null });
            showPreview(file);
        });
    }

    function showPreview(file) {
        const reader = new FileReader();
        const div = document.createElement("div");
        div.className = "preview-card";

        const img = document.createElement("img");
        img.className = "preview-img";

        const sizeLabel = document.createElement("p");
        sizeLabel.className = "img-size";
        sizeLabel.innerText = `Original: ${(file.size / 1024).toFixed(1)} KB`;

        const compressBtn = document.createElement("button");
        compressBtn.className = "compressBtn";
        compressBtn.innerText = "Compress";
        compressBtn.onclick = () => compressImage(file, div);

        const downloadBtn = document.createElement("button");
        downloadBtn.className = "downloadBtn";
        downloadBtn.innerText = "Download";
        downloadBtn.style.display = "none";

        reader.onload = e => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        div.appendChild(img);
        div.appendChild(sizeLabel);
        div.appendChild(compressBtn);
        div.appendChild(downloadBtn);
        previewContainer.appendChild(div);
    }

    async function compressImage(file, card) {
        const loader = document.createElement("div");
        loader.className = "loader";
        card.appendChild(loader);

        try {
            const response = await fetch("YOUR_CLOUDFLARE_WORKER_URL", {
                method: "POST",
                body: file
            });

            const arrayBuffer = await response.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: file.type });

            const downloadURL = URL.createObjectURL(blob);
            const compressedSize = (blob.size / 1024).toFixed(1);

            card.querySelector(".img-size").innerText += ` → Compressed: ${compressedSize} KB`;
            const downloadBtn = card.querySelector(".downloadBtn");
            downloadBtn.href = downloadURL;
            downloadBtn.download = file.name;
            downloadBtn.style.display = "block";

            loader.remove();
        } catch (err) {
            alert("Compression failed. Check Worker URL & API key.");
            loader.remove();
        }
    }

    compressAllBtn.addEventListener("click", function () {
        const cards = document.querySelectorAll(".preview-card");
        const files = [...selectedFiles];
        files.forEach((item, index) => {
            compressImage(item.file, cards[index]);
        });
    });
});

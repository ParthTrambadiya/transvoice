document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
    const dropZoneElement = inputElement.closest(".drop-zone");
  
    dropZoneElement.addEventListener("click", (e) => {
        inputElement.click();
    });
  
    inputElement.addEventListener("change", (e) => {
        if (inputElement.files.length) {
            updateThumbnail(dropZoneElement, inputElement.files[0]);
        }
    });
  
    dropZoneElement.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZoneElement.classList.add("drop-zone--over");
    });
  
    ["dragleave", "dragend"].forEach((type) => {
        dropZoneElement.addEventListener(type, (e) => {
            dropZoneElement.classList.remove("drop-zone--over");
        });
    });
  
    dropZoneElement.addEventListener("drop", (e) => {
        e.preventDefault();
    
        if (e.dataTransfer.files.length) {
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }
    
        dropZoneElement.classList.remove("drop-zone--over");
    });
});
  
  /**
   * Updates the thumbnail on a drop zone element.
   *
   * @param {HTMLElement} dropZoneElement
   * @param {File} file
   */
function updateThumbnail(dropZoneElement, file) {
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");
  
    // First time - remove the prompt
    if (dropZoneElement.querySelector(".drop-zone__prompt")) {
        dropZoneElement.querySelector(".drop-zone__prompt").remove();
    }
  
  // First time - there is no thumbnail element, so lets create it
    if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        dropZoneElement.appendChild(thumbnailElement);
    }
  
    thumbnailElement.dataset.label = file.name;
  
    //Show thumbnail for image files
    if (file.type.startsWith("audio/wav")) {
        const reader = new FileReader();
  
        reader.readAsDataURL(file);
        reader.onload = () => {
            thumbnailElement.style.backgroundImage = `url('./assets/voice.jpg')`;
            thumbnailElement.style.backgroundSize = `auto`;
            thumbnailElement.style.backgroundRepeat = `no-repeat`;
            thumbnailElement.style.backgroundPosition = `center`;
        };
    } else {
        swal({
            title: "Warning!",
            text: "Please provide .wav music file.",
            icon: "warning",
        });
        thumbnailElement.remove();
        drop_prompt = document.createElement("span");
        drop_prompt_text = document.createTextNode("Drop file here or click to upload");
        drop_prompt.classList.add('drop-zone__prompt');
        drop_prompt.appendChild(drop_prompt_text)
        dropZoneElement.appendChild(drop_prompt);
        document.getElementById("fileUpload").value = "";
    }
}
  
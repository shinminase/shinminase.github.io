const dropArea = document.getElementById('drop-area');
const previewArea = document.getElementById('preview');
const fileElem = document.getElementById('fileElem');
const svgPreview = document.getElementById('svg-preview');
let images = [];
let fileNames = [];
let imageAttributes = []; // Stores the width, height, x, y for each image
let draggedElement = null;
const gap = 5; // Constant gap between images

['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropArea.classList.add('hover');
  });
});

['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, () => {
    dropArea.classList.remove('hover');
  });
});

dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  handleFiles(files);
});

fileElem.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  [...files].forEach((file, index) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      images.push(reader.result); // Base64 encoded image
      fileNames.push(file.name); // Store filename for reordering

      const img = new Image();
      img.src = reader.result;

      // Wait for the image to load to get its natural width and height
      img.onload = () => {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        // Set the x position for the new image
        let previousImage = imageAttributes[imageAttributes.length - 1]; // The last added image
        let xPosition = previousImage ? previousImage.x + previousImage.width + gap : 0; // If it's the first image, x = 0

        // Store the image's natural dimensions and position
        imageAttributes.push({ 
          width: naturalWidth, 
          height: naturalHeight, 
          x: xPosition, 
          y: 25 
        });

        let fileEntry = document.createElement('div');
        fileEntry.className = 'file-entry';

        let fileNameDiv = document.createElement('div');
        fileNameDiv.className = 'file-name';
        fileNameDiv.textContent = file.name;
        fileNameDiv.draggable = true;

        // Create delete button
        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
          const indexToDelete = images.length - 1; // Index of the last added image
          deleteImage(indexToDelete); // Call the delete function
        });

        // Drag-and-drop functionality
        fileNameDiv.addEventListener('dragstart', (e) => {
          draggedElement = fileEntry; // Store the dragged element
          draggedElement.classList.add('dragging'); // Add a class to indicate dragging
        });

        fileNameDiv.addEventListener('dragend', (e) => {
          draggedElement.classList.remove('dragging'); // Remove dragging class
          draggedElement = null; // Reset dragged element
        });

        // Allow dragging over other file entries
        fileNameDiv.addEventListener('dragover', (e) => {
          e.preventDefault(); // Prevent default to allow drop
        });

        // Handle the drop event
        fileNameDiv.addEventListener('drop', (e) => {
          e.preventDefault();
          if (draggedElement !== fileEntry) {
            // Get the indices of the dragged and target elements
            let draggedIndex = [...previewArea.children].indexOf(draggedElement);
            let targetIndex = [...previewArea.children].indexOf(fileEntry);

            // Swap filenames
            [fileNames[draggedIndex], fileNames[targetIndex]] = [fileNames[targetIndex], fileNames[draggedIndex]];

            // Swap images and attributes
            [images[draggedIndex], images[targetIndex]] = [images[targetIndex], images[draggedIndex]];
            [imageAttributes[draggedIndex], imageAttributes[targetIndex]] = [imageAttributes[targetIndex], imageAttributes[draggedIndex]];

            // Move the dragged element before the target element
            if (targetIndex < draggedIndex) {
              previewArea.insertBefore(draggedElement, fileEntry); // Move the dragged element before the target
            } else {
              previewArea.insertBefore(draggedElement, fileEntry.nextSibling); // Move the dragged element after the target
            }
            
            // Update positions of remaining images
            updateImagePositions();
          }
        });

        // Input fields for width, height, x, y
        let widthInput = createInputField(imageAttributes, 'width', images.length - 1);
        let heightInput = createInputField(imageAttributes, 'height', images.length - 1);
        let xInput = createInputField(imageAttributes, 'x', images.length - 1);
        let yInput = createInputField(imageAttributes, 'y', images.length - 1);

        // Append to fileEntry
        fileEntry.appendChild(fileNameDiv);
        fileEntry.appendChild(document.createTextNode('Width: '));
        fileEntry.appendChild(widthInput);
        fileEntry.appendChild(document.createTextNode('Height: '));
        fileEntry.appendChild(heightInput);
        fileEntry.appendChild(document.createTextNode('X: '));
        fileEntry.appendChild(xInput);
        fileEntry.appendChild(document.createTextNode('Y: '));
        fileEntry.appendChild(yInput);
        fileEntry.appendChild(deleteButton); // Append delete button

        previewArea.appendChild(fileEntry);
      };
    };
    reader.readAsDataURL(file);
  });
}

// Create input field for dynamic attribute updates
function createInputField(attributesArray, attributeKey, index) {
  let input = document.createElement('input');
  input.type = 'number';
  input.value = attributesArray[index][attributeKey];

  input.addEventListener('input', (e) => {
    attributesArray[index][attributeKey] = parseInt(e.target.value);
  });

  return input;
}

// Function to delete an image by index
function deleteImage(index) {
  // Remove from arrays
  images.splice(index, 1);
  fileNames.splice(index, 1);
  imageAttributes.splice(index, 1);

  // Remove the corresponding DOM element
  const fileEntries = previewArea.children;
  if (fileEntries[index]) {
    previewArea.removeChild(fileEntries[index]);
  }

  // Update positions of remaining images
  updateImagePositions();
}

// Function to update image positions after deletion
function updateImagePositions() {
  let xPosition = 0; // Reset x position
  imageAttributes.forEach((attrs, index) => {
    attrs.x = xPosition; // Set new x position
    xPosition += attrs.width + gap; // Update for next image
  });
}

function generateSVG() {
  let svgTemplate = `
  <svg viewBox="0 0 800 90" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <style>
      .marquee {
        animation: scroll 15s linear infinite;
      }
      @keyframes scroll {
        0% {
          transform: translateX(100%);
        }
        100% {
          transform: translateX(-250%);
        }
      }
    </style>
    <defs>
      <path id="marqueePath" d="M 0,50 H 1600" />
    </defs>
    <g class="marquee">
  `;

  images.forEach((image, index) => {
    const attrs = imageAttributes[index];
    svgTemplate += `
      <g transform="scale(1.5)">
        <image xlink:href="${image}" width="${attrs.width}" height="${attrs.height}" x="${attrs.x}" y="${attrs.y}" />
      </g>
    `;
  });

  svgTemplate += `
    </g>
  </svg>`;

  document.getElementById('svg-output').value = svgTemplate;
  svgPreview.innerHTML = svgTemplate;
}

function copyToClipboard() {
  const svgCode = document.getElementById('svg-output').value;
  navigator.clipboard.writeText(svgCode).then(() => {
    alert("SVG code copied to clipboard!");
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

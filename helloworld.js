
        // Theme switching
        function switchTheme(theme) {
            const root = document.documentElement;
            switch(theme) {
                case 'cyberpunk':
                    root.style.setProperty('--main-bg', '#008080');
                    root.style.setProperty('--main-color', '#00ff00');
                    root.style.setProperty('--accent-color', '#ff00ff');
                    root.style.setProperty('--console-border', '#333');
                    break;
                case 'vaporwave':
                    root.style.setProperty('--main-bg', '#ff6ad5');
                    root.style.setProperty('--main-color', '#8b2eff');
                    root.style.setProperty('--accent-color', '#00faff');
                    root.style.setProperty('--console-border', '#ff00ff');
                    break;
                case 'matrix':
                    root.style.setProperty('--main-bg', '#000000');
                    root.style.setProperty('--main-color', '#00ff00');
                    root.style.setProperty('--accent-color', '#008000');
                    root.style.setProperty('--console-border', '#003300');
                    break;
            }
        }

        // Tab switching
        function switchTab(tabId) {
            const contents = document.getElementsByClassName('content');
            for (let content of contents) {
                content.classList.remove('active');
            }
            document.getElementById(tabId).classList.add('active');
        }

        // Sigil actions
        function sigilAction(action) {
            const sigil = document.querySelector('.digital-sigil');
            sigil.style.animation = `${action} 0.5s`;
            setTimeout(() => { sigil.style.animation = ''; }, 500);

            const burst = document.querySelector('.sigil-burst');
            burst.style.animation = 'none';
            burst.offsetHeight; // Trigger reflow
            burst.style.animation = 'burstAnimation 1s';

            // Add more complex behaviors here
            switch(action) {
                case 'activate':
                    // Change sigil color
                    document.querySelectorAll('.sigil-shape').forEach(shape => {
                        shape.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
                    });
                    break;
                case 'resonate':
                    // Increase rotation speed
                    document.querySelectorAll('.sigil-part').forEach(part => {
                        part.style.animationDuration = '5s';
                    });
                    setTimeout(() => {
                        document.querySelectorAll('.sigil-part').forEach(part => {
                            part.style.animationDuration = '10s';
                        });
                    }, 5000);
                    break;
                case 'dissipate':
                    // Fade out and in
                    sigil.style.opacity = '0';
                    setTimeout(() => { sigil.style.opacity = '1'; }, 1000);
                    break;
            }
        }

        // Make windows and console draggable
        const draggables = [...document.getElementsByClassName('window'), document.querySelector('.console-container')];
        for (let elem of draggables) {
            makeDraggable(elem);
        }

        function makeDraggable(element) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            if (element.classList.contains('window')) {
                element.querySelector('.window-title').onmousedown = dragMouseDown;
            } else {
                element.onmousedown = dragMouseDown;
            }

            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            }

            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                element.style.top = (element.offsetTop - pos2) + "px";
                element.style.left = (element.offsetLeft - pos1) + "px";
            }

            function closeDragElement() {
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }


        // Chat system
        const chatBox = document.getElementById('chatBox');
        const chatUsers = ['Xenotrek', 'Splicer', 'Lusynth', 'Ten-Tongues'];
        const chatTopics = ['synth music', 'cybernetic enhancements', 'virtual reality', 'AI ethics', 'neon aesthetics', 'digital art'];

        function generateChatMessage() {
            const user = chatUsers[Math.floor(Math.random() * chatUsers.length)];
            const topic = chatTopics[Math.floor(Math.random() * chatTopics.length)];
            const message = `Hey, have you heard about the latest developments in ${topic}?`;
            
            const chatMessage = document.createElement('div');
            chatMessage.classList.add('chat-message');
            chatMessage.innerHTML = `<span class="chat-username">${user}:</span> ${message}`;
            
            chatBox.appendChild(chatMessage);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        setInterval(generateChatMessage, 5000);

        // Window focus effect
        const windows = document.querySelectorAll('.window');
        windows.forEach(win => {
            win.addEventListener('mousedown', () => {
                windows.forEach(w => w.style.zIndex = '10');
                win.style.zIndex = '11';
            });
        });

        // Make console draggable and always on top
        const consoleContainer = document.querySelector('.console-container');
        consoleContainer.addEventListener('mousedown', () => {
            windows.forEach(w => w.style.zIndex = '10');
            consoleContainer.style.zIndex = '100';
        });
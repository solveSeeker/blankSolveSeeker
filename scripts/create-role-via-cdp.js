const WebSocket = require('ws');

const CDP_URL = 'ws://localhost:9222/devtools/page/D8B23670EC1879F1E66DAAE05798B042';

const ws = new WebSocket(CDP_URL);

let messageId = 1;

function sendCommand(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = messageId++;
    const message = JSON.stringify({ id, method, params });

    const handler = (data) => {
      const response = JSON.parse(data);
      if (response.id === id) {
        ws.removeListener('message', handler);
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.result);
        }
      }
    };

    ws.on('message', handler);
    ws.send(message);
  });
}

ws.on('open', async () => {
  try {
    console.log('Connected to Chrome DevTools Protocol');

    // Enable Runtime domain
    await sendCommand('Runtime.enable');

    // Click the "Crear Rol" button
    const clickButtonScript = `
      (function() {
        const button = Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent.includes('Crear Rol'));
        if (button) {
          button.click();
          return 'Button clicked';
        }
        return 'Button not found';
      })()
    `;

    const clickResult = await sendCommand('Runtime.evaluate', {
      expression: clickButtonScript,
      returnByValue: true
    });

    console.log('Click result:', clickResult.result.value);

    // Wait for dialog to open
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Fill the form
    const fillFormScript = `
      (function() {
        const nameInput = document.querySelector('input[id="name"]');
        const descInput = document.querySelector('input[id="description"]');

        if (nameInput && descInput) {
          nameInput.value = 'admin';
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));

          descInput.value = 'Administrador del sistema';
          descInput.dispatchEvent(new Event('input', { bubbles: true }));

          return 'Form filled';
        }
        return 'Form inputs not found';
      })()
    `;

    const fillResult = await sendCommand('Runtime.evaluate', {
      expression: fillFormScript,
      returnByValue: true
    });

    console.log('Fill result:', fillResult.result.value);

    // Click save button
    const saveScript = `
      (function() {
        const saveButton = Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent.includes('Guardar') && btn.type === 'submit');
        if (saveButton) {
          saveButton.click();
          return 'Save button clicked';
        }
        return 'Save button not found';
      })()
    `;

    const saveResult = await sendCommand('Runtime.evaluate', {
      expression: saveScript,
      returnByValue: true
    });

    console.log('Save result:', saveResult.result.value);

    console.log('✅ Admin role created successfully!');

    ws.close();
    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    ws.close();
    process.exit(1);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
  process.exit(1);
});

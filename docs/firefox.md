# Loading the Vuser Browser Extension in Firefox

## 1. Make the manifest Firefox‑compatible
Add a `browser_specific_settings` block to `browser-extension/manifest.json`:
```json
"browser_specific_settings": {
  "gecko": {
    "id": "vuser@example.com",
    "strict_min_version": "109.0"
  }
}
```
*The `id` is used for native‑messaging registration; `strict_min_version` ensures the extension runs only on recent Firefox versions.*

## 2. Load the extension temporarily (development)
1. Open **Firefox** → `about:debugging` → **This Firefox**.
2. Click **Load Temporary Add‑on…**.
3. Select the `manifest.json` inside `browser-extension/`.
The extension will appear under “Temporary Extensions” and stay loaded until Firefox restarts.

## 3. Register the native‑messaging host for Firefox
```bash
mkdir -p ~/.mozilla/native-messaging-hosts
cp native-test-host/org.vuser.protocol.host.json \
   ~/.mozilla/native-messaging-hosts/vuser.protocol.host.json
```
Edit the copied file, replacing the Chrome‑specific `allowed_origins` with Firefox’s `allowed_extensions` and the same ID used above:
```json
{
  "name": "org.vuser.protocol.host",
  "description": "Vuser Protocol Native Host",
  "path": "/Users/prabhatsingh/vuser/native-test-host/host.py",
  "type": "stdio",
  "allowed_extensions": ["vuser@example.com"]
}
```
Set strict permissions:
```bash
chmod 600 ~/.mozilla/native-messaging-hosts/vuser.protocol.host.json
```

## 4. Verify the connection
* Open a page that matches the `matches` pattern in `manifest.json`.
* Open the Web Console (`Ctrl+Shift+K`).
* Look for logs from `content.js`/`background.js` indicating the native host is connected.
If you see *“Native messaging host not found”*, double‑check the host JSON location, path, and file permissions.

## 5. (Optional) Publish a signed add‑on
1. Zip the `browser-extension` folder and rename to `vuser.xpi`.
2. Sign the XPI via Mozilla Add‑ons (AMO) or the `web-ext` CLI:
```bash
npm install -g web-ext
web-ext sign --api-key <key> --api-secret <secret> \
   --source-dir browser-extension
```
Signed XPI files can be installed permanently via **Add‑on file** in `about:addons`.

---
*These steps let you develop and test the Vuser extension in Firefox, and optionally distribute a signed version.*

# TradingView Alert Auto-Restart Extension

A Chrome extension that automatically monitors and restarts failed TradingView alerts. It helps maintain continuous alert monitoring by automatically restarting alerts that have stopped due to technical issues, while respecting manually stopped alerts.

## Origin & Recommendation

This plugin was specifically created for automated trading with the indicators from the TradingIQ community ([https://www.tradingiq.io/](https://www.tradingiq.io/)). While it works perfectly fine with any TradingView alert, we highly recommend checking out the TradingIQ website and their Discord community. Their indicators are specifically designed for automation and have proven to work exceptionally well in automated trading setups.

## ⚠️ Disclaimer

While it's technically against TradingView's rules to automate tasks on their platform, you're very unlikely to receive a penalty for small-scale uses of this tool. Still, this is something to keep in mind! To give an example, all indicator vendors on TradingView automate approval and removal of their paid indicators to users. This is technically against house rules, but, everyone does it, TV knows we do it, and it's "silently permitted". So, as long as you don't plan to use this tool so heavily that you set the TV server room on fire, it *should* be ok in most instances, but just keep this consideration in mind regardless!

## Features

- Checks alert status every 10 seconds
- Automatically restarts failed alerts
- Ignores manually stopped alerts
- Implements a graduated retry system with configurable maximum retries
- Each retry attempt increases wait time by 1 minute (1st retry = 1 min, 2nd = 2 min, etc.)
- Aggressively handles connection losses by automatically reloading the page when a disconnect is detected

## Installation

1. Download all extension files to a local directory
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The extension icon should appear in your Chrome toolbar

## Required Files

- `manifest.json` - Extension configuration
- `background.js` - Core monitoring logic
- `popup.html` - Settings interface
- `popup.js` - Settings handling

## Configuration

Click the extension icon to access settings:
- **Maximum Retries**: Set how many times the extension should attempt to restart each alert (1-20)

## How It Works

The extension:
1. Monitors the active TradingView tab
2. Checks for connection losses and reloads page if needed
3. Identifies alerts that have stopped
4. Attempts to restart them using a graduated retry system
5. Waits longer between each retry attempt
6. Stops retrying after reaching the configured maximum attempts

## Limitations & Requirements

### Alert naming
The alert MUST have a name, and cannot be empty. This unfortunately is a requirement.

### Language Support
- Only supports English and German TradingView interface language

### Active Tab Requirement
- The TradingView tab must be active in Chrome for the extension to work
- Chrome must remain open and the computer must not go to sleep

### TradingView Session Management
IMPORTANT: TradingView severely limits multiple active sessions on the same account
When you log into TradingView on multiple devices or browsers, previous sessions often get disconnected
These disconnects will stop alerts from working and prevent the plugin from performing its function
Because of this, you MUST use this setup:
1. A browser with this extension and the TradingView website open and the tab beeing active(!)
2. Use the TradingView desktop or mobile app for your regular trading activities
3. Never log into the TradingView website on any other device or browser
4. Keep the monitoring PC running continuously


## License

MIT License with Attribution Requirement

Copyright (c) 2025 Victor Geyer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. Attribution must be given to the original project and creator in any derivative works, modifications, or distributions of the Software. This attribution must be clearly visible in the software's documentation and source code.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
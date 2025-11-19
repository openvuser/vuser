
// Mock Chrome API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn()
    },
    onStartup: {
      addListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    },
    connectNative: jest.fn().mockReturnValue({
      onMessage: {
        addListener: jest.fn()
      },
      onDisconnect: {
        addListener: jest.fn()
      },
      postMessage: jest.fn()
    })
  },
  tabs: {
    query: jest.fn()
  }
};

// Load the background script
// Note: Since background.js is not a module, we might need to read it and eval it, 
// or just test the logic if we exported it. 
// For this example, we will assume we can require it or copy the logic to test.
// A common pattern for non-module extension scripts is to wrap them or use a loader.
// Here we will mock the setup and test the logic by simulating events.

describe('Background Script', () => {
  let portMock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    portMock = {
      onMessage: { addListener: jest.fn() },
      onDisconnect: { addListener: jest.fn() },
      postMessage: jest.fn()
    };
    
    chrome.runtime.connectNative.mockReturnValue(portMock);
  });

  test('should connect to native host on startup', () => {
    // Trigger the logic that runs on startup
    // Since we can't easily require the file without running it, 
    // we'll manually invoke the setup if we had exported it, 
    // or we just verify the side effects if we require the file.
    
    // Let's try to require the file. 
    // Note: This might fail if the file has top-level execution that depends on things we haven't mocked perfectly.
    // But we mocked chrome.runtime.connectNative.
    
    jest.isolateModules(() => {
      require('../background.js');
    });

    expect(chrome.runtime.connectNative).toHaveBeenCalledWith('org.vuser.protocol.host');
  });

  test('should handle getTabs message from native host', () => {
    jest.isolateModules(() => {
      require('../background.js');
    });

    // Get the listener registered on port.onMessage
    const messageListener = portMock.onMessage.addListener.mock.calls[0][0];
    
    // Mock tabs
    const mockTabs = [
      { id: 1, title: 'Tab 1', url: 'http://example.com', status: 'complete', active: true }
    ];
    chrome.tabs.query.mockImplementation((query, callback) => {
      callback(mockTabs);
    });

    // Simulate message
    messageListener({ action: 'getTabs', id: '123' });

    expect(chrome.tabs.query).toHaveBeenCalled();
    expect(portMock.postMessage).toHaveBeenCalledWith({
      id: '123',
      tabs: expect.arrayContaining([
        expect.objectContaining({ id: 1, title: 'Tab 1' })
      ])
    });
  });
});

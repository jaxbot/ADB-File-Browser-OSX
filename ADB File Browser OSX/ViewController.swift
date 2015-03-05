//
//  ViewController.swift
//  ADB Browser OSX
//
//  Created by Jonathan Warner on 2/22/15.
//  Copyright (c) 2015 Jonathan Warner. All rights reserved.
//

import Cocoa
import WebKit
import Foundation

class ViewController: NSViewController, WKScriptMessageHandler {
    var webView: WKWebView?
    var localBase = NSURL(string: "about:blank")
    
    override func loadView() {
        var contentController = WKUserContentController();
        contentController.addScriptMessageHandler(
            self,
            name: "callbackHandler"
        )

        var config = WKWebViewConfiguration()
        config.userContentController = contentController
        self.webView = WKWebView(frame: NSRect(x: 0,y: 0,width: 0,height: 0), configuration: config)
        
        self.view = self.webView!
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        var url = NSBundle.mainBundle().URLForResource("index", withExtension: "html");
        var request = NSURLRequest(URL: url!)
        webView?.loadRequest(request)
        var cwdString = "window.cwd=\"" + (NSProcessInfo.processInfo().arguments[0] as String) + "\""
        webView?.evaluateJavaScript(cwdString, completionHandler: nil)
    }
    
    func userContentController(userContentController: WKUserContentController,didReceiveScriptMessage message: WKScriptMessage) {
        if(message.name == "callbackHandler") {
            var data = message.body as NSDictionary
            
            var string = getStringFromCommand(data["command"] as String, arguments: data["arguments"] as [String])
            string = (string.stringByReplacingOccurrencesOfString("\n", withString: "\\n", options: nil, range: nil))
            string = (string.stringByReplacingOccurrencesOfString("\r", withString: "\\r", options: nil, range: nil))
            println(string)
            var callbackString = "window.callbacksFromOS[\"" + (data["callbackFunction"] as String) + "\"](\"" + string + "\")"
            webView?.evaluateJavaScript(callbackString, completionHandler: nil)
        }
    }
    
    func getStringFromCommand(command: String, arguments: [String]) -> String {
        let task = NSTask()
        task.launchPath = command
        task.arguments = arguments
        
        let pipe = NSPipe()
        task.standardOutput = pipe
        task.launch()
        
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        let output: String = NSString(data: data, encoding: NSUTF8StringEncoding)!
        
        return output
    }
    
    override var representedObject: AnyObject? {
        didSet {
            // Update the view, if already loaded.
        }
    }
}



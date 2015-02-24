//
//  ViewController.swift
//  ADB Browser OSX
//
//  Created by Jonathan Warner on 2/22/15.
//  Copyright (c) 2015 Jonathan Warner. All rights reserved.
//

import Cocoa
import WebKit

class ViewController: NSViewController, WKScriptMessageHandler {
    var webView: WKWebView?
    
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
        
        var url = NSURL(string: "http://www.google.com")
        var request = NSURLRequest(URL: url!)
        //webView?.loadRequest(request)
        webView?.loadHTMLString("<script>webkit.messageHandlers.callbackHandler.postMessage('Send from JavaScript');</script>", baseURL: url)
        // Do any additional setup after loading the view.
        
    }
    
    func userContentController(userContentController: WKUserContentController,didReceiveScriptMessage message: WKScriptMessage) {
        if(message.name == "callbackHandler") {
            println("JavaScript is sending a message \(message.body)")
        }
    }
    
    override var representedObject: AnyObject? {
        didSet {
            // Update the view, if already loaded.
        }
    }
}



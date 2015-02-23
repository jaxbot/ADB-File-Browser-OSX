//
//  ViewController.swift
//  ADB Browser OSX
//
//  Created by Jonathan Warner on 2/22/15.
//  Copyright (c) 2015 Jonathan Warner. All rights reserved.
//

import Cocoa
import WebKit

class ViewController: NSViewController {
    var webView: WKWebView?
    
    override func loadView() {
        self.webView = WKWebView()
        
        //If you want to implement the delegate
        //self.webView!.navigationDelegate = self
        
        self.view = self.webView!
        
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        var url = NSURL(string: "http://www.google.com")
        var request = NSURLRequest(URL: url!)
        webView?.loadRequest(request)
        // Do any additional setup after loading the view.
    }
    
    override var representedObject: AnyObject? {
        didSet {
            // Update the view, if already loaded.
        }
    }
    
    
}



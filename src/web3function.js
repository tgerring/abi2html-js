"use strict";

var Web3Function = function(abiItem) {
    this.func = new EvmFunction(abiItem)
    this.name = this.func.name
    this.abi = this.func.abi
}


Web3Function.prototype.Call = function(userOptions, callback) {
    var kv = []
    for (var i = 0; i < this.func.inputs.length; i++) {
        var field = this.func.inputs[i]
        var val = document.getElementById(field.htmlId).value
            // if (val.length > 0) {
        field.setValue(val)
        kv.push(field.value)
            // }
    }

    // set transaction options
    var options = {
        from: userOptions.from,
        to: userOptions.to,
        // gas: userOptions.gas,
        // gasPrice: userOptions.gasPrice,
        data: userOptions.data,
        // value: userOptions.value
    }
    kv.push(options)


    // we want to modify the original object since it may have
    // htmlId set on it
    var func = this.func
        // set callback
    var cb = function(err, results) {
        // only supports "results" as single argument
        // not sure how multiple return values look yet        
        if (err) func.error = err
        else delete func['error']

        if (!err)
            for (var i = 0; i < func.outputs.length; i++) {
                var field = func.outputs[i]
                field.setValue(results) // single needs to become multiple
            }

        // return updated object to caller
        if (typeof callback === 'function') callback(func)
    }
    kv.push(cb)

    // get instance of contract
    var contract = this.contract.at(options.to)
    var contractFunction = contract[this.name]
    contractFunction.call.apply(contractFunction, kv)
}


Web3Function.prototype.Transact = function(userOptions, callback) {
    var kv = []
    for (var i = 0; i < this.func.inputs.length; i++) {
        var field = this.func.inputs[i]
        var val = document.getElementById(field.htmlId).value
        kv.push(val)
    }

    // set transaction options
    var options = {
        from: userOptions.from,
        to: userOptions.to,
        gas: userOptions.gas,
        gasPrice: userOptions.gasPrice,
        data: userOptions.data,
        value: userOptions.value
    }
    kv.push(options);


    // set callback
    var func = this.func
    var cb = function(err, txhash) {
        if (err) func.error = err
        if (!err)
            func.transactionHash = txhash

        if (typeof callback === "function") callback(func)
    }
    kv.push(cb)

    // get instance of contract
    var contract = this.contract.at(options.to)
    var contractFunction = contract[this.name]
    contractFunction.sendTransaction.apply(contractFunction, kv)
}

Web3Function.prototype.makeFieldForm = function(callCallback, transactCallback) {
    var item = this.func
    var div = document.createElement('div')
    div.className = ['function'].join(' ')
    div.id = 'function' + item.name

    var h3 = document.createElement('h3')
    h3.innerHTML = item.name
    div.appendChild(h3)


    // generate inputs with html id
    if (item.inputs.length > 0) {
        var fsi = document.createElement('fieldset')
        fsi.className = 'inputs'

        var leg = document.createElement('legend')
        leg.innerHTML = 'Inputs'
        fsi.appendChild(leg)

        item.inputs.forEach(function(field) {
            field.setHtmlId(['function', item.name, 'input'].join('-'))
            fsi.appendChild(field.DefaultRenderer(true))
        })

    }

    // generate outputs with htmlid
    if (item.outputs.length > 0) {
        var fso = document.createElement('fieldset')
        fso.className = 'outputs'

        var leg = document.createElement('legend')
        leg.innerHTML = 'Outputs'
        fso.appendChild(leg)

        item.outputs.forEach(function(field) {
            field.setHtmlId(['function', item.name, 'output'].join('-'))
            fso.appendChild(field.DefaultRenderer(false))
        })

    }

    // display call button when we the function has output fields
    if (item.outputs.length > 0) {
        var btn = document.createElement('button')
        btn.type = 'button'
        btn.innerHTML = 'Call'
        var that = this
        btn.addEventListener('click', function() {
            callCallback(that)
        })
        div.appendChild(btn)
    }

    if (!item.constant) {
        var tbtn = document.createElement('button')
        tbtn.type = 'button'
        tbtn.innerHTML = 'Transact'
        var that = this
        tbtn.addEventListener('click', function() {
            transactCallback(that)
        })
        div.appendChild(tbtn)
    }

    if (item.inputs.length > 0)
        div.appendChild(fsi)
    if (item.outputs.length > 0)
        div.appendChild(fso)

    return div
}

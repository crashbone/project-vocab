window.okanDE = window.okanDE ?? {};

window.okanDE.util = {
    splitLibrary: {
        flatten: function (arr) {
            var self = this;
            return arr.reduce(function (acc, val) {
                return acc.concat(val.constructor === Array ? self.flatten(val) : val);
            }, []);
        },
        traverseListFunc: function (list, expression, index, func) {
            var self = this;
            if (list[index]) {
                if ((list.constructor !== String) && (list[index].constructor === String))
                    (list[index] != func(list[index], expression)) ? list[index] = func(list[index], expression) : null;
                (list[index].constructor === Array) ? self.traverseListFunc(list[index], expression, 0, func) : null;
                (list.conFstructor === Array) ? self.traverseListFunc(list, expression, index + 1, func) : null;
            }
        },
        mapFuncToString: function (string, expressions, func) {
            var self = this;
            var list = [string];
            for (var i = 0, len = expressions.length; i < len; i++) {
                self.traverseListFunc(list, expressions[i], 0, func);
            }
            return self.flatten(list);
        },
        splitString: function (string, splitters) {
            return this.mapFuncToString(string, splitters, function (item, expression) {
                return item.split(expression);
            })
        },
    },
    readFileFromServer(url) {
        var xmlHttp = new XMLHttpRequest()
        xmlHttp.open("GET", url, false) // false for synchronous request
        xmlHttp.send(null)
        return xmlHttp.responseText
    },

    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
}

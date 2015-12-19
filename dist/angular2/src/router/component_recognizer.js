'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var route_recognizer_1 = require('./route_recognizer');
var route_config_impl_1 = require('./route_config_impl');
var async_route_handler_1 = require('./async_route_handler');
var sync_route_handler_1 = require('./sync_route_handler');
/**
 * `ComponentRecognizer` is responsible for recognizing routes for a single component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
var ComponentRecognizer = (function () {
    function ComponentRecognizer() {
        this.names = new collection_1.Map();
        // map from name to recognizer
        this.auxNames = new collection_1.Map();
        // map from starting path to recognizer
        this.auxRoutes = new collection_1.Map();
        // TODO: optimize this into a trie
        this.matchers = [];
        this.defaultRoute = null;
    }
    /**
     * returns whether or not the config is terminal
     */
    ComponentRecognizer.prototype.config = function (config) {
        var handler;
        if (lang_1.isPresent(config.name) && config.name[0].toUpperCase() != config.name[0]) {
            var suggestedName = config.name[0].toUpperCase() + config.name.substring(1);
            throw new exceptions_1.BaseException("Route \"" + config.path + "\" with name \"" + config.name + "\" does not begin with an uppercase letter. Route names should be CamelCase like \"" + suggestedName + "\".");
        }
        if (config instanceof route_config_impl_1.AuxRoute) {
            handler = new sync_route_handler_1.SyncRouteHandler(config.component, config.data);
            var path = config.path.startsWith('/') ? config.path.substring(1) : config.path;
            var recognizer = new route_recognizer_1.RouteRecognizer(config.path, handler);
            this.auxRoutes.set(path, recognizer);
            if (lang_1.isPresent(config.name)) {
                this.auxNames.set(config.name, recognizer);
            }
            return recognizer.terminal;
        }
        var useAsDefault = false;
        if (config instanceof route_config_impl_1.Redirect) {
            var redirector = new route_recognizer_1.RedirectRecognizer(config.path, config.redirectTo);
            this._assertNoHashCollision(redirector.hash, config.path);
            this.matchers.push(redirector);
            return true;
        }
        if (config instanceof route_config_impl_1.Route) {
            handler = new sync_route_handler_1.SyncRouteHandler(config.component, config.data);
            useAsDefault = lang_1.isPresent(config.useAsDefault) && config.useAsDefault;
        }
        else if (config instanceof route_config_impl_1.AsyncRoute) {
            handler = new async_route_handler_1.AsyncRouteHandler(config.loader, config.data);
            useAsDefault = lang_1.isPresent(config.useAsDefault) && config.useAsDefault;
        }
        var recognizer = new route_recognizer_1.RouteRecognizer(config.path, handler);
        this._assertNoHashCollision(recognizer.hash, config.path);
        if (useAsDefault) {
            if (lang_1.isPresent(this.defaultRoute)) {
                throw new exceptions_1.BaseException("Only one route can be default");
            }
            this.defaultRoute = recognizer;
        }
        this.matchers.push(recognizer);
        if (lang_1.isPresent(config.name)) {
            this.names.set(config.name, recognizer);
        }
        return recognizer.terminal;
    };
    ComponentRecognizer.prototype._assertNoHashCollision = function (hash, path) {
        this.matchers.forEach(function (matcher) {
            if (hash == matcher.hash) {
                throw new exceptions_1.BaseException("Configuration '" + path + "' conflicts with existing route '" + matcher.path + "'");
            }
        });
    };
    /**
     * Given a URL, returns a list of `RouteMatch`es, which are partial recognitions for some route.
     */
    ComponentRecognizer.prototype.recognize = function (urlParse) {
        var solutions = [];
        this.matchers.forEach(function (routeRecognizer) {
            var pathMatch = routeRecognizer.recognize(urlParse);
            if (lang_1.isPresent(pathMatch)) {
                solutions.push(pathMatch);
            }
        });
        return solutions;
    };
    ComponentRecognizer.prototype.recognizeAuxiliary = function (urlParse) {
        var routeRecognizer = this.auxRoutes.get(urlParse.path);
        if (lang_1.isPresent(routeRecognizer)) {
            return [routeRecognizer.recognize(urlParse)];
        }
        return [async_1.PromiseWrapper.resolve(null)];
    };
    ComponentRecognizer.prototype.hasRoute = function (name) { return this.names.has(name); };
    ComponentRecognizer.prototype.componentLoaded = function (name) {
        return this.hasRoute(name) && lang_1.isPresent(this.names.get(name).handler.componentType);
    };
    ComponentRecognizer.prototype.loadComponent = function (name) {
        return this.names.get(name).handler.resolveComponentType();
    };
    ComponentRecognizer.prototype.generate = function (name, params) {
        var pathRecognizer = this.names.get(name);
        if (lang_1.isBlank(pathRecognizer)) {
            return null;
        }
        return pathRecognizer.generate(params);
    };
    ComponentRecognizer.prototype.generateAuxiliary = function (name, params) {
        var pathRecognizer = this.auxNames.get(name);
        if (lang_1.isBlank(pathRecognizer)) {
            return null;
        }
        return pathRecognizer.generate(params);
    };
    return ComponentRecognizer;
})();
exports.ComponentRecognizer = ComponentRecognizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3JlY29nbml6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2NvbXBvbmVudF9yZWNvZ25pemVyLnRzIl0sIm5hbWVzIjpbIkNvbXBvbmVudFJlY29nbml6ZXIiLCJDb21wb25lbnRSZWNvZ25pemVyLmNvbnN0cnVjdG9yIiwiQ29tcG9uZW50UmVjb2duaXplci5jb25maWciLCJDb21wb25lbnRSZWNvZ25pemVyLl9hc3NlcnROb0hhc2hDb2xsaXNpb24iLCJDb21wb25lbnRSZWNvZ25pemVyLnJlY29nbml6ZSIsIkNvbXBvbmVudFJlY29nbml6ZXIucmVjb2duaXplQXV4aWxpYXJ5IiwiQ29tcG9uZW50UmVjb2duaXplci5oYXNSb3V0ZSIsIkNvbXBvbmVudFJlY29nbml6ZXIuY29tcG9uZW50TG9hZGVkIiwiQ29tcG9uZW50UmVjb2duaXplci5sb2FkQ29tcG9uZW50IiwiQ29tcG9uZW50UmVjb2duaXplci5nZW5lcmF0ZSIsIkNvbXBvbmVudFJlY29nbml6ZXIuZ2VuZXJhdGVBdXhpbGlhcnkiXSwibWFwcGluZ3MiOiJBQUFBLHFCQUFpQywwQkFBMEIsQ0FBQyxDQUFBO0FBQzVELDJCQUE4QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQy9FLDJCQUE2RCxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzlGLHNCQUFzQywyQkFBMkIsQ0FBQyxDQUFBO0FBRWxFLGlDQUtPLG9CQUFvQixDQUFDLENBQUE7QUFDNUIsa0NBQXFFLHFCQUFxQixDQUFDLENBQUE7QUFDM0Ysb0NBQWdDLHVCQUF1QixDQUFDLENBQUE7QUFDeEQsbUNBQStCLHNCQUFzQixDQUFDLENBQUE7QUFLdEQ7Ozs7R0FJRztBQUNIO0lBQUFBO1FBQ0VDLFVBQUtBLEdBQUdBLElBQUlBLGdCQUFHQSxFQUEyQkEsQ0FBQ0E7UUFFM0NBLDhCQUE4QkE7UUFDOUJBLGFBQVFBLEdBQUdBLElBQUlBLGdCQUFHQSxFQUEyQkEsQ0FBQ0E7UUFFOUNBLHVDQUF1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QUNBLG9CQUFvQkEsRUFBRUEsQ0FBQ0E7SUFDN0RBLENBQUNBO0lBRURSLHNDQUFRQSxHQUFSQSxVQUFTQSxJQUFZQSxFQUFFQSxNQUFXQTtRQUNoQ1MsSUFBSUEsY0FBY0EsR0FBb0JBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQzNEQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDekNBLENBQUNBO0lBRURULCtDQUFpQkEsR0FBakJBLFVBQWtCQSxJQUFZQSxFQUFFQSxNQUFXQTtRQUN6Q1UsSUFBSUEsY0FBY0EsR0FBb0JBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQzlEQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDekNBLENBQUNBO0lBQ0hWLDBCQUFDQTtBQUFEQSxDQUFDQSxBQXJJRCxJQXFJQztBQXJJWSwyQkFBbUIsc0JBcUkvQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc0JsYW5rLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge01hcCwgTWFwV3JhcHBlciwgTGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1Byb21pc2UsIFByb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuaW1wb3J0IHtcbiAgQWJzdHJhY3RSZWNvZ25pemVyLFxuICBSb3V0ZVJlY29nbml6ZXIsXG4gIFJlZGlyZWN0UmVjb2duaXplcixcbiAgUm91dGVNYXRjaFxufSBmcm9tICcuL3JvdXRlX3JlY29nbml6ZXInO1xuaW1wb3J0IHtSb3V0ZSwgQXN5bmNSb3V0ZSwgQXV4Um91dGUsIFJlZGlyZWN0LCBSb3V0ZURlZmluaXRpb259IGZyb20gJy4vcm91dGVfY29uZmlnX2ltcGwnO1xuaW1wb3J0IHtBc3luY1JvdXRlSGFuZGxlcn0gZnJvbSAnLi9hc3luY19yb3V0ZV9oYW5kbGVyJztcbmltcG9ydCB7U3luY1JvdXRlSGFuZGxlcn0gZnJvbSAnLi9zeW5jX3JvdXRlX2hhbmRsZXInO1xuaW1wb3J0IHtVcmx9IGZyb20gJy4vdXJsX3BhcnNlcic7XG5pbXBvcnQge0NvbXBvbmVudEluc3RydWN0aW9ufSBmcm9tICcuL2luc3RydWN0aW9uJztcblxuXG4vKipcbiAqIGBDb21wb25lbnRSZWNvZ25pemVyYCBpcyByZXNwb25zaWJsZSBmb3IgcmVjb2duaXppbmcgcm91dGVzIGZvciBhIHNpbmdsZSBjb21wb25lbnQuXG4gKiBJdCBpcyBjb25zdW1lZCBieSBgUm91dGVSZWdpc3RyeWAsIHdoaWNoIGtub3dzIGhvdyB0byByZWNvZ25pemUgYW4gZW50aXJlIGhpZXJhcmNoeSBvZlxuICogY29tcG9uZW50cy5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudFJlY29nbml6ZXIge1xuICBuYW1lcyA9IG5ldyBNYXA8c3RyaW5nLCBSb3V0ZVJlY29nbml6ZXI+KCk7XG5cbiAgLy8gbWFwIGZyb20gbmFtZSB0byByZWNvZ25pemVyXG4gIGF1eE5hbWVzID0gbmV3IE1hcDxzdHJpbmcsIFJvdXRlUmVjb2duaXplcj4oKTtcblxuICAvLyBtYXAgZnJvbSBzdGFydGluZyBwYXRoIHRvIHJlY29nbml6ZXJcbiAgYXV4Um91dGVzID0gbmV3IE1hcDxzdHJpbmcsIFJvdXRlUmVjb2duaXplcj4oKTtcblxuICAvLyBUT0RPOiBvcHRpbWl6ZSB0aGlzIGludG8gYSB0cmllXG4gIG1hdGNoZXJzOiBBYnN0cmFjdFJlY29nbml6ZXJbXSA9IFtdO1xuXG4gIGRlZmF1bHRSb3V0ZTogUm91dGVSZWNvZ25pemVyID0gbnVsbDtcblxuICAvKipcbiAgICogcmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgY29uZmlnIGlzIHRlcm1pbmFsXG4gICAqL1xuICBjb25maWcoY29uZmlnOiBSb3V0ZURlZmluaXRpb24pOiBib29sZWFuIHtcbiAgICB2YXIgaGFuZGxlcjtcblxuICAgIGlmIChpc1ByZXNlbnQoY29uZmlnLm5hbWUpICYmIGNvbmZpZy5uYW1lWzBdLnRvVXBwZXJDYXNlKCkgIT0gY29uZmlnLm5hbWVbMF0pIHtcbiAgICAgIHZhciBzdWdnZXN0ZWROYW1lID0gY29uZmlnLm5hbWVbMF0udG9VcHBlckNhc2UoKSArIGNvbmZpZy5uYW1lLnN1YnN0cmluZygxKTtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBSb3V0ZSBcIiR7Y29uZmlnLnBhdGh9XCIgd2l0aCBuYW1lIFwiJHtjb25maWcubmFtZX1cIiBkb2VzIG5vdCBiZWdpbiB3aXRoIGFuIHVwcGVyY2FzZSBsZXR0ZXIuIFJvdXRlIG5hbWVzIHNob3VsZCBiZSBDYW1lbENhc2UgbGlrZSBcIiR7c3VnZ2VzdGVkTmFtZX1cIi5gKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgQXV4Um91dGUpIHtcbiAgICAgIGhhbmRsZXIgPSBuZXcgU3luY1JvdXRlSGFuZGxlcihjb25maWcuY29tcG9uZW50LCBjb25maWcuZGF0YSk7XG4gICAgICBsZXQgcGF0aCA9IGNvbmZpZy5wYXRoLnN0YXJ0c1dpdGgoJy8nKSA/IGNvbmZpZy5wYXRoLnN1YnN0cmluZygxKSA6IGNvbmZpZy5wYXRoO1xuICAgICAgdmFyIHJlY29nbml6ZXIgPSBuZXcgUm91dGVSZWNvZ25pemVyKGNvbmZpZy5wYXRoLCBoYW5kbGVyKTtcbiAgICAgIHRoaXMuYXV4Um91dGVzLnNldChwYXRoLCByZWNvZ25pemVyKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY29uZmlnLm5hbWUpKSB7XG4gICAgICAgIHRoaXMuYXV4TmFtZXMuc2V0KGNvbmZpZy5uYW1lLCByZWNvZ25pemVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZWNvZ25pemVyLnRlcm1pbmFsO1xuICAgIH1cblxuICAgIHZhciB1c2VBc0RlZmF1bHQgPSBmYWxzZTtcblxuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBSZWRpcmVjdCkge1xuICAgICAgbGV0IHJlZGlyZWN0b3IgPSBuZXcgUmVkaXJlY3RSZWNvZ25pemVyKGNvbmZpZy5wYXRoLCBjb25maWcucmVkaXJlY3RUbyk7XG4gICAgICB0aGlzLl9hc3NlcnROb0hhc2hDb2xsaXNpb24ocmVkaXJlY3Rvci5oYXNoLCBjb25maWcucGF0aCk7XG4gICAgICB0aGlzLm1hdGNoZXJzLnB1c2gocmVkaXJlY3Rvcik7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgUm91dGUpIHtcbiAgICAgIGhhbmRsZXIgPSBuZXcgU3luY1JvdXRlSGFuZGxlcihjb25maWcuY29tcG9uZW50LCBjb25maWcuZGF0YSk7XG4gICAgICB1c2VBc0RlZmF1bHQgPSBpc1ByZXNlbnQoY29uZmlnLnVzZUFzRGVmYXVsdCkgJiYgY29uZmlnLnVzZUFzRGVmYXVsdDtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIEFzeW5jUm91dGUpIHtcbiAgICAgIGhhbmRsZXIgPSBuZXcgQXN5bmNSb3V0ZUhhbmRsZXIoY29uZmlnLmxvYWRlciwgY29uZmlnLmRhdGEpO1xuICAgICAgdXNlQXNEZWZhdWx0ID0gaXNQcmVzZW50KGNvbmZpZy51c2VBc0RlZmF1bHQpICYmIGNvbmZpZy51c2VBc0RlZmF1bHQ7XG4gICAgfVxuICAgIHZhciByZWNvZ25pemVyID0gbmV3IFJvdXRlUmVjb2duaXplcihjb25maWcucGF0aCwgaGFuZGxlcik7XG5cbiAgICB0aGlzLl9hc3NlcnROb0hhc2hDb2xsaXNpb24ocmVjb2duaXplci5oYXNoLCBjb25maWcucGF0aCk7XG5cbiAgICBpZiAodXNlQXNEZWZhdWx0KSB7XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMuZGVmYXVsdFJvdXRlKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgT25seSBvbmUgcm91dGUgY2FuIGJlIGRlZmF1bHRgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZGVmYXVsdFJvdXRlID0gcmVjb2duaXplcjtcbiAgICB9XG5cbiAgICB0aGlzLm1hdGNoZXJzLnB1c2gocmVjb2duaXplcik7XG4gICAgaWYgKGlzUHJlc2VudChjb25maWcubmFtZSkpIHtcbiAgICAgIHRoaXMubmFtZXMuc2V0KGNvbmZpZy5uYW1lLCByZWNvZ25pemVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlY29nbml6ZXIudGVybWluYWw7XG4gIH1cblxuXG4gIHByaXZhdGUgX2Fzc2VydE5vSGFzaENvbGxpc2lvbihoYXNoOiBzdHJpbmcsIHBhdGgpIHtcbiAgICB0aGlzLm1hdGNoZXJzLmZvckVhY2goKG1hdGNoZXIpID0+IHtcbiAgICAgIGlmIChoYXNoID09IG1hdGNoZXIuaGFzaCkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBDb25maWd1cmF0aW9uICcke3BhdGh9JyBjb25mbGljdHMgd2l0aCBleGlzdGluZyByb3V0ZSAnJHttYXRjaGVyLnBhdGh9J2ApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYSBVUkwsIHJldHVybnMgYSBsaXN0IG9mIGBSb3V0ZU1hdGNoYGVzLCB3aGljaCBhcmUgcGFydGlhbCByZWNvZ25pdGlvbnMgZm9yIHNvbWUgcm91dGUuXG4gICAqL1xuICByZWNvZ25pemUodXJsUGFyc2U6IFVybCk6IFByb21pc2U8Um91dGVNYXRjaD5bXSB7XG4gICAgdmFyIHNvbHV0aW9ucyA9IFtdO1xuXG4gICAgdGhpcy5tYXRjaGVycy5mb3JFYWNoKChyb3V0ZVJlY29nbml6ZXI6IEFic3RyYWN0UmVjb2duaXplcikgPT4ge1xuICAgICAgdmFyIHBhdGhNYXRjaCA9IHJvdXRlUmVjb2duaXplci5yZWNvZ25pemUodXJsUGFyc2UpO1xuXG4gICAgICBpZiAoaXNQcmVzZW50KHBhdGhNYXRjaCkpIHtcbiAgICAgICAgc29sdXRpb25zLnB1c2gocGF0aE1hdGNoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBzb2x1dGlvbnM7XG4gIH1cblxuICByZWNvZ25pemVBdXhpbGlhcnkodXJsUGFyc2U6IFVybCk6IFByb21pc2U8Um91dGVNYXRjaD5bXSB7XG4gICAgdmFyIHJvdXRlUmVjb2duaXplcjogUm91dGVSZWNvZ25pemVyID0gdGhpcy5hdXhSb3V0ZXMuZ2V0KHVybFBhcnNlLnBhdGgpO1xuICAgIGlmIChpc1ByZXNlbnQocm91dGVSZWNvZ25pemVyKSkge1xuICAgICAgcmV0dXJuIFtyb3V0ZVJlY29nbml6ZXIucmVjb2duaXplKHVybFBhcnNlKV07XG4gICAgfVxuXG4gICAgcmV0dXJuIFtQcm9taXNlV3JhcHBlci5yZXNvbHZlKG51bGwpXTtcbiAgfVxuXG4gIGhhc1JvdXRlKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5uYW1lcy5oYXMobmFtZSk7IH1cblxuICBjb21wb25lbnRMb2FkZWQobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaGFzUm91dGUobmFtZSkgJiYgaXNQcmVzZW50KHRoaXMubmFtZXMuZ2V0KG5hbWUpLmhhbmRsZXIuY29tcG9uZW50VHlwZSk7XG4gIH1cblxuICBsb2FkQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMubmFtZXMuZ2V0KG5hbWUpLmhhbmRsZXIucmVzb2x2ZUNvbXBvbmVudFR5cGUoKTtcbiAgfVxuXG4gIGdlbmVyYXRlKG5hbWU6IHN0cmluZywgcGFyYW1zOiBhbnkpOiBDb21wb25lbnRJbnN0cnVjdGlvbiB7XG4gICAgdmFyIHBhdGhSZWNvZ25pemVyOiBSb3V0ZVJlY29nbml6ZXIgPSB0aGlzLm5hbWVzLmdldChuYW1lKTtcbiAgICBpZiAoaXNCbGFuayhwYXRoUmVjb2duaXplcikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aFJlY29nbml6ZXIuZ2VuZXJhdGUocGFyYW1zKTtcbiAgfVxuXG4gIGdlbmVyYXRlQXV4aWxpYXJ5KG5hbWU6IHN0cmluZywgcGFyYW1zOiBhbnkpOiBDb21wb25lbnRJbnN0cnVjdGlvbiB7XG4gICAgdmFyIHBhdGhSZWNvZ25pemVyOiBSb3V0ZVJlY29nbml6ZXIgPSB0aGlzLmF1eE5hbWVzLmdldChuYW1lKTtcbiAgICBpZiAoaXNCbGFuayhwYXRoUmVjb2duaXplcikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aFJlY29nbml6ZXIuZ2VuZXJhdGUocGFyYW1zKTtcbiAgfVxufVxuIl19
const HenriBase = require('./base/henri');
const Modules = require('./0.modules');
const Pen = require('./0.pen');
const validator = require('validator');

const Config = require('./0.config');
const Graphql = require('./1.graphql');
const Controllers = require('./2.controllers');
const Server = require('./2.server');
const Model = require('./3.model');
const View = require('./3.view');
const User = require('./4.user');
const Router = require('./5.router');

const path = require('path');

class Henri extends HenriBase {
  constructor(props) {
    super(props);

    this.pen = new Pen();
    this.modules = new Modules(this);

    this.validator = validator;
    this.utils = require('./utils');

    this.status = new Map();
    this._middlewares = [];

    !this.isTest && (global['henri'] = this);

    this.changeDirectory();

    if (this.runlevel < 6) {
      this.pen.warn('henri', 'running at limited level', this.runlevel);
    }
  }

  async init() {
    this.modules.add(new Config());
    this.modules.add(new Graphql());
    this.modules.add(new Controllers());
    this.modules.add(new Server());
    this.modules.add(new Model());
    this.modules.add(new Router());
    this.modules.add(new User());
    this.modules.add(new View());

    await this.modules.init();
  }

  changeDirectory() {
    if (
      this.prefix !== '.' &&
      require(path.join(process.cwd(), './package.json')).onboard !== true
    ) {
      const target = path.resolve(process.cwd(), this.prefix);
      try {
        process.chdir(target);
        this.pen.warn('henri', 'cwd change', process.cwd());
      } catch (e) {
        this.pen.error('henri', 'invalid directory', target);
      }
    }
  }

  async reload() {
    return this.modules.reload();
  }

  async stop() {
    return this.modules.stop();
  }

  addMiddleware(func) {
    this._middlewares.push(func);
  }

  gql(ast) {
    return `${ast}`;
  }
}

module.exports = Henri;

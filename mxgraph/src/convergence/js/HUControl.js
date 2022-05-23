class HUControl extends UiComponent {

  constructor(options) {
    super("div", "hu-control", "hu");
    this._options = options;
    this._init();
  }

  _init() {
    const {filter} = rxjs.operators;

    this._open = false;

    this._unread = 0;

    this._badge = $('<div>', {class: "hu-badge"});
    this._badge.css("visibility", "hidden");
    this._el.append(this._badge);

    this._huIcon = $("<i>", {class: "hu-icon fa fa-comments", "aria-hidden": true, text:"\tHISTORIAS DE SESIÓN"});
    this._huIcon.on("click", () => this._toggle());
    this._el.append(this._huIcon);
    

    this._huWindow = new HUWindow({
      room: this._options.room,
      username: this._options.username,
      sessionId: this._options.sessionId,
      colorManager: this._options.colorManager,
      onClose: () => this._toggle()
    });

    this._el.append(this._huWindow._el);

    this._options.room.events()
      .pipe(filter((e) => e.name === "message"))
      .subscribe(() => {
        if (!this._open) {
          this._unread++;
          this._badge.text(this._unread);
          this._badge.css("visibility", "visible");
        }
      });
  }

  _toggle() {
    this._open = !this._open;
    if (this._open) {
      this._badge.text("");
      this._unread = 0;
      this._badge.css("visibility", "hidden");
      this._huIcon.addClass("hu-icon-open");
    } else {
      this._huIcon.removeClass("hu-icon-open");
    }
    this._huWindow.toggle();
  }
}

class HUWindow extends UiComponent {
  constructor(options) {
    super("div", "hu-window");
    this._visible = false;
    this._options = options;
    this._init();
  }

  _init() {
    const title = $("<div>", {class: "hu-window-title"}).text("HU Contribuidores");
    const close = $("<i>", {class: "hu-window-close fa fa-times"});
    close.on("click", () => this._options.onClose());
    title.append(close);
    this._el.append(title);

    this._messagePane = new HUMessagePane({
      username: this._options.username,
      color: this._options.colorManager.color(this._options.username),
      colorManager: this._options.colorManager,
      room: this._options.room
    });
    this._el.append(this._messagePane._el);

    this._messageInput = new HUMessageInput({
      huWindow: this
    });
    this._el.append(this._messageInput._el);

    this.setVisible(false);
  }

  toggle() {
    this._visible = !this._visible;
    this.setVisible(this._visible);
  }

  setVisible(visible) {
    this._el.css("visibility", visible ? "visible" : "hidden");
  }

  _sendMessage(message) {
    this._options.room.send(message).catch(e => console.log(e));
  }
}

class HUMessagePane extends UiComponent {

  constructor(options) {
    super("div", "hu-messages");

    this._options = options;
    this._init();
  }

  _init() {
    const {filter} = rxjs.operators;
    this._options.room
      .events()
      .pipe(filter((e) => e.name === "message"))
      .subscribe((e) => {
        this._appendRemoteMessage(
          e.message,
          e.user,
          e.timestamp,
          this._options.colorManager.color(e.user.username))
      });
  }

  _appendRemoteMessage(message, user, timestamp, color) {
    const displayName = user.displayName ? user.displayName : user.username;
    const msg = new HUMessage({
      message: message,
      username: displayName,
      timestamp: timestamp,
      color: color
    });
    this._append(msg);

  }

  _appendLocalMessage(message) {
    const user = this._options.room.session().user();
    const displayName = user.displayName ? user.displayName : user.username;
    const msg = new HUMessage({
      message: message,
      timestamp: new Date().getTime(),
      username: displayName,
      color: this._options.color
    });
    this._append(msg);
  }

  _append(message) {
    this._el.append(message._el);
    this._el.scrollTop(this._el[0].scrollHeight);
  }
}

class HUMessage extends UiComponent {
  constructor(options) {
    super("div", "hu-message");
    this._options = options;

    this._init();
  }

  _init() {
    const timestamp = moment(this._options.timestamp);
    this._el.css("border-left-color", this._options.color);

    const header = $('<div>', {class: "hu-header"});
    //header.append($('<span>', {class: "hu-user"}).text(this._options.username));
    header.append($('<span>', {class: "hu-time"}).text(timestamp.format("h:mm a")));
    header.append('a');
    this._el.append(header);

    this._el.append($('<span>', {class: "hu-text"}).text(this._options.message));
  }
}

class HUMessageInput extends UiComponent {
  constructor(options) {
    super("input", "hu-input");
    this._options = options;
    this._init();
  }
  
  _init() {
    const contador=0;
    this._el.attr("value", "HU 0 - " + (contador));
    this._el.on("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        this._sendMessage(this._el.val());
        this._el.val("HU 0 - ");
        return false;
      }
    });
  }

  _sendMessage(message) {
    this._options.huWindow._sendMessage(message);
  }
}

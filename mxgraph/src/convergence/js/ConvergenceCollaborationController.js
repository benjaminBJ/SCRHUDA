class ConvergenceCollaborationController {
  static GRAPH_PARAM = "diagram";

  static FIRST_NAMES = ["Usuario"];
  static LAST_NAMES = [
    "Oso",
    "Perro",
    "Pulpo",
    "Flamengo",
    "Gato",
    "Canguro",
    "Delfín",
    "Elefante",
    "Girafa",
  ];
  static num = 1;
  static generateUserName(nombre) {
    const fName = Math.floor(
      Math.random() * ConvergenceCollaborationController.FIRST_NAMES.length
    );
    const lName = Math.floor(
      Math.random() * ConvergenceCollaborationController.LAST_NAMES.length
    );
    if(nombre.length > 1){
      return nombre;
    }
    else{
      return (
        ConvergenceCollaborationController.FIRST_NAMES[fName] +
        " " +
        ConvergenceCollaborationController.LAST_NAMES[lName]
      );
    }
    
  }

  static _getGraphId() {
    const url = new URL(location.href);
    let id = url.searchParams.get(
      ConvergenceCollaborationController.GRAPH_PARAM
    );
    if (!id) {
      id = ConvergenceCollaborationController._createUUID();
      url.searchParams.append(
        ConvergenceCollaborationController.GRAPH_PARAM,
        id
      );
      window.history.pushState({}, "", url.href);
    }
    return id;
  }

  static _createUUID() {
    let dt = new Date().getTime();
    //URL a compartir generar variable
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
    const uuid2 = "a";
    return uuid;
  }

  static newWindowWithGraph() {
    window.open(window.location.href, "_blank");
  }

  constructor(url) {
    this._domain = null;
    this._url = url;
  }

  connect(nombre) {
    if (urlParams["user"] != null){
      nombre=urlParams["user"];
    }
    const displayName = ConvergenceCollaborationController.generateUserName(nombre);
    return Convergence.connectAnonymously(this._url, displayName).then(
      (domain) => {
        this._domain = domain;
      }
    );
  }

  createEditorController() {
    return new ConvergenceEditorController(
      this._domain,
      ConvergenceCollaborationController._getGraphId()
    );
  }
}

class ConvergenceEditorController {
  constructor(domain, modelId) {
    this._domain = domain;
    this._modelId = modelId;
    this._room = null;
    this._roomH = null;
    this._activity = null;
    this._activityColorManager = null;
    this._login = null;
  }

  init() {
    const { MxGraphAdapter, PointerManager, SelectionManager, Deserializer } =
      ConvergenceMxGraphAdapter;

    return Promise.all([
      this._openModel(),
      this._joinActivity(),
      this._joinChat(),
    ]).then(() => {
      const mxModel = Deserializer.deserializeMxGraphModel(
        this._model.root().value()
      );
      const editor = new Editor(urlParams["chrome"] === "0", {}, mxModel);

      const overviewContainer = document.createElement("div");
      overviewContainer.className = "collab-overview-container";
      EditorUi.prototype.createSidebarFooterContainer = () => {
        return overviewContainer;
      };
      EditorUi.prototype.sidebarFooterHeight = 200;

      const ui = new EditorUi(editor);

      ui.handleError = (e) => {
        console.error(e);
      };

      setTimeout(() => editor.graph.view.refresh(), 0);

      this._modelAdapter = new MxGraphAdapter(editor.graph, this._model.root());
      this._pointerManager = new PointerManager(
        editor.graph,
        this._activity,
        this._activityColorManager
      );
      this._selectionManager = new SelectionManager(
        editor.graph,
        this._activity,
        this._activityColorManager,
        this._modelAdapter
      );

      this._presenceList = new PresenceList({
        activity: this._activity,
        colorManager: this._activityColorManager,
      });
      document
        .getElementById("presence")
        .appendChild(this._presenceList.getElement());

      this._chatControl = new ChatControl({
        room: this._room,
        username: this._domain.session().user().displayName,
        sessionId: this._domain.session().sessionId(),
        colorManager: this._activityColorManager,
      });

      document.body.appendChild(this._chatControl.getElement());

      //intento
      /*
      this._huControl = new HUControl({
        room: this._room,
        username: this._domain.session().user().displayName,
        sessionId: this._domain.session().sessionId(),
        colorManager: this._activityColorManager,
      });

      document.body.appendChild(this._huControl.getElement());
      //fin intento
      */

      /*intento login
        this._login = new LoginDialog({
          room: this._room,
          username: this._domain.session().user().displayName,
          sessionId: this._domain.session().sessionId(),
          colorManager: this._activityColorManager
        });
        document.body.appendChild(this._login.getElement());
        //fin intento*/
      this._overview = new Overview({
        graph: editor.graph,
        activity: this._activity,
        colorManager: this._activityColorManager,
      });
      overviewContainer.appendChild(this._overview.getElement());

      const shareControls = new ShareControls({ id: this._modelId });
      ui.toolbarContainer.appendChild(shareControls.getElement());
    });
  }

  _openModel() {
    const { Serializer } = ConvergenceMxGraphAdapter;
    return this._domain
      .models()
      .openAutoCreate({
        id: this._modelId,
        collection: MxGraphConfig.COLLECTION_ID,
        ephemeral: false, //REVISAR
        data: Serializer.serializeMxGraphModel(new mxGraphModel()),
      })
      .then((model) => {
        this._model = model;
      });
  }

  _joinActivity() {
    const { ActivityColorManager } = ConvergenceMxGraphAdapter;
    const options = {
      autoCreate: {
        ephemeral: true,
        worldPermissions: ["join", "view_state", "set_state"],
      },
    };
    return this._domain
      .activities()
      .join("mxgraph.project", this._modelId, options)
      .then((activity) => {
        this._activity = activity;
        this._activityColorManager = new ActivityColorManager(activity);
      });
  }

  _joinChat() {
    const id = "mxgraph.project." + this._modelId;
    return this._domain
      .chat()
      .create({
        id,
        type: "room",
        membership: "public",
        ignoreExistsError: true,
      })
      .then((chatId) => {
        return this._domain.chat().join(chatId);
      })
      .then((room) => {
        this._room = room;
      });
  }

  _joinHU() {
    const id = "mxgraph.project." + this._modelId;
    return this._domain
      .hu()
      .create({
        id,
        type: "room",
        membership: "public",
        ignoreExistsError: true,
      })
      .then((huId) => {
        return this._domain.hu().join(huId);
      })
      .then((roomH) => {
        this._room = roomH;
      });
  }
}

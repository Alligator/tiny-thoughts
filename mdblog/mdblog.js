(function () {
  var states = {
    'h1 search': 0,
    'h2 search': 1,
    'post body': 2
  };

  function mdblog(selector, target) {
    var elm = document.querySelector(selector),
        src = elm.innerHTML,
        tokens = marked.lexer(src),
        posts = [],
        title = {},
        state = states['h1 search'];

    var currentTitle = '',
        tokenStack = [];

    function addTitle() {
      var ta = [currentTitle];

      ta.links = {};
      var titleHtml = marked.parser(ta);

      tokenStack.links = {}
      var html = marked.parser(tokenStack);

      posts.push({title: currentTitle.text, titleHtml: titleHtml, html: html, id: currentTitle.text.replace(/[^a-zA-Z0-9]/g, '-')});

      tokenStack = [];
    }

    tokens.forEach(function (token) {
      switch (state) {

        case states['h1 search']:
          if (token.depth === 1 && token.type === 'heading') {
            var ta = [token];
            ta.links = {};
            title.html = marked.parser(ta);
          }
          state = states['h2 search'];
          break;

        case states['h2 search']:
          if (token.depth === 2 && token.type === 'heading') {
            currentTitle = token;
          }
          state = states['post body'];
          break;

        case states['post body']:
          if (token.depth === 2 && token.type === 'heading') {
            addTitle();
            currentTitle = token;
          }
          else {
            tokenStack.push(token);
          }
          break;
      }
    });

    if (tokenStack.length > 0) {
      addTitle();
    }

    displayBlog(title, posts, target);
  }

  function displayBlog(title, posts, target) {
    var el = document.querySelector(target),
        postEl = document.createElement('div'),
        tocEl = document.createElement('div');

    el.innerHTML += title.html;
    el.appendChild(buildToc(tocEl, posts));
    el.appendChild(postEl);

    function goToHash () {
      tocEl.style.display = 'none';
      var id = location.hash.substring(1);
      if (id.length > 0) {
        var post = posts.reduce(function (a, b) { return b.id === id ? b : a; });
        buildPost(postEl, post);
      }
      else {
        tocEl.style.display = 'block';
        postEl.innerHTML = '';
      }
    }

    if (location.hash.length > 0) {
      goToHash();
    }

    window.addEventListener('hashchange', goToHash, false);
  }

  function buildToc(el, posts) {
    posts.forEach(function (post) {
      el.innerHTML += '<div><a href="#' + post.id + '">' + post.title + '</a></div>';
    });
    return el;
  }

  function buildPost(el, post) {
    el.innerHTML = post.titleHtml;
    el.innerHTML += post.html;
    return el;
  }

  window.mdblog = mdblog;
}());

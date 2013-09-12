// The semicolon at the beginning is in case of another library breaking ours (prevents ASI errors).
// This plugin is being created using absolutely 0 semi-colons.  We are using our knowledge of Automatic
// semicolon insertion (ASI) in JavaScript to do that for us, so we don't have to.  It's an experiment in cleanliness
// if nothing else.

;(function ($) {

  $.fn.midasAutocomplete = function (options) {
    options = options || {}

    var $input                = this.last(),
        on                    = options.on,
        type                  = options.type,
        $inputData            = $input.text(),
        $triggerChar          = options.trigger,
        backbone              = options.backbone,
        queryParam            = options.queryParam,
        contentType           = options.contentType,
        apiEndpoint           = options.apiEndpoint,
        $inputDataAsArray     = $inputData.split(""),
        $firstCharOfInput     = $inputDataAsArray[0],
        backboneEvents        = options.backboneEvents,
        searchResultsWrapper  = options.searchResultsClass,

        // Here they can override the success and failure messages completely
        // But this override is not implemented yet.
        success               = options.success || (function () {}),
        failure               = options.failure || (function () {})
        


    // If we are using the backbone event bus then skip all binding, and move onto another check.
    if (backboneEvents === true && (!options.trigger || options.trigger === false)) {
      fetchDataUsingBackboneOrAjax()
    }

    if (typeof on === "string") {
      $input.bind(on, function () {
        fetchDataUsingBackboneOrAjax()
      })
    }

    // Here we check if the trigger character exists, and if so we
    // wait for it before initializing search, and of course strip it out before
    // the search.
    if ($triggerChar) {
      if ($firstCharOfInput === $triggerChar) {
        // Strip off first elem of array, and join back up to string
        // then set the $inputData that the ajax uses to the output of that 
        $inputDataAsArray.shift()
        $inputData = $inputDataAsArray.join("")
        fetchDataUsingBackboneOrAjax()
      } else {
        $(searchResultsWrapper).children().remove()
        return;
      }
    }

    function fetchDataUsingBackboneOrAjax () {
      var typeOfBackboneParam = typeof backbone

      switch (typeOfBackboneParam) {
        case "object":
          initializeBackboneAutocomplete()
          break
        case "boolean" || "undefined":
          // If they accidentally passed a boolean of true, expecting us to handle the rest, prompt them on how
          // incorrect that is.
          if (backbone === true) console.warn("You need to pass an object to the backbone paramater, with your views and models to spin up.  True won't cut it.")
          initializeAjaxAutocomplete()
          break
      }

    }

    function initializeBackboneAutocomplete () {
      console.log("Not yet implemented")
    }


    // -----------------------------
    //= Begin AJAX Implementation
    // -----------------------------
    function initializeAjaxAutocomplete () {

      // We need to make sure we check that the user didn't add a trailing / 
      // as the backend will respond to a /path?QUERYPARAM=foo
      // Not a /path/?queryPARAM=foo
      // so we need to make sure we pop that off if it is there
      var _s  = apiEndpoint.split(""),
          len = _s.length - 1,
          cleanedEndpoint

      if (_s[len] === "/") {
        cleanedEndpoint = _s.pop()
        return cleanedEndpoint
      } else {
        cleanedEndpoint = apiEndpoint
      }

      $.ajax({

        url: cleanedEndpoint + '?' + queryParam + '=' + $inputData,
        type: type,
        contentType: contentType,

        success: function (data) {

          // This won't work, but somehow check if they have set it on the front-end and 
          // if so use that success method instead of this one.
          // if (success) {
            // success(data) // here what I am trying to show is we want to pass data to success method
          // },

          var i = 0,
              results = data.length

          function setEndOfContenteditable(contentEditableElement) {
              var range,selection;
              if (document.createRange) {
                  range = document.createRange();
                  range.selectNodeContents(contentEditableElement);
                  range.collapse(false);
                  selection = window.getSelection();
                  selection.removeAllRanges();
                  selection.addRange(range);
              }
          }

          // On each new successful character search, 
          // replace the previous results, and append the new results.
          $(searchResultsWrapper).children().remove()

          for ( ; i < results; i += 1 ) {
            $(searchResultsWrapper).append(template(data[i]))
          }

          $(".search-result-row").on("click", function (e) {
            var e = $(e.currentTarget).children(".search-result-value").text() + " ";
            console.log(e);
            if ($(this).children().children("a").text() !== "") {
              var a = $(this).children().children("a")[0]
              $(".comment-content:first-child").text("")
              $(".comment-content:first-child").append(a)
              $(".comment-content:first-child").append("<span class='focus' style='margin-left: 5px; background: #fff; margin-right: 5px;'>" + "-" + "</span")
              // setEndOfContenteditable($(".comment-content:first-child").get(0)) // get dom node not jquery object
            } else {
              $(".comment-content:first-child").text("").append("<span style='background: #eee;'>" + e + "</span>" + "<span class='focus' style='margin-left: 5px; background: #fff; margin-right: 5px;'>" + "-" + "</span")
              // setEndOfContenteditable($(".search").get(0)) // get dom node not jquery object
            }
          })
        },

        error: function (err) {
          if (!err.responseText) console.warn("Please add some response text to your server side error")
          if (typeof err.responseText === "string") this.json = JSON.parse(err.responseText)

          alert("Expects a hash of { 'message': 'error message' } (Here's ours):" + " " + this.json.message)
        }

      })
    }

    // The template classes don't really need to be customized, they can just expect them and then
    // style to that effect.  The reason they don't need to be customized is because they are being appended
    // to a customizable container.  So with that it's enough and we can just allow them to expect this.
    function template (result) {
      // Here we are going to want to abstract out what the result.____ methods are
      // so for instance if the result.target is something that is used, then we use that.
      // but if instead the user wants to send something back from the server like { foo: 'val', bar: 'val' }
      // then we somehow need to be able to handle it here in the template.
      // 
      // OR the other optinos is to say that these words target and value are standardized enough for an autocomplete
      // that they can then craft the backend to match this API expectation on the front-end.  I think that is a more
      // elegant solution.  
      
      // Here what we are doing is we are checking for the result.target (type) to match predefined
      // patterns then we are setting some icons for those types.  Ideal: comes back from server with icon.
      // For now, a switch statement here would work great. 
      // We are overriding the result.target with the icon type so that we don't have to do the check within the return
      // statement.
      if (result.target === "wikipedia") {
        result.target = "<img src='http://i.imgur.com/EwNMVSb.png' width='40px' />"
        result.value = "<a style='cursor: pointer; cursor: hand;' target='_blank' href='http://en.wikipedia.org/wiki/Special:Search?search=" + result.value + "&go=Go'>" + result.value + "</a>"
      } else if (result.target === "user") {
        result.target = "<img src='http://i.imgur.com/URcgvDA.png' width='40px' />"
      }

      return " " +
        "<div class='search-result-row' style='cursor: hand; cursor: pointer;'> " +
          "<span class='search-result-type' style='border-right: 1px #000 solid; height: 100%; float: left;'>" +
            result.target +    
          "</span>" +
          "<br />" + 
          "<span class='search-result-value' style='float: left;'>" +
            result.value + 
          "</span>" +
        "</div>"
    }

  }

  // ------
  // = UTILITY Function 
  // ------
  function removeTrailingBackslash (str) {
    var _s  = str.split(""),
        len = _s.length - 1

    if (_s[len] === "/") {
      return _s.pop()
    }

  }


}(jQuery));
const editorHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <style>
        html {
            width: 100%;
        }
        body {
            overflow: scroll;
            margin: 0;
            padding: 2px;
        }
        #editor {
            height: calc(100vh - 5px);
            overflow-y: scroll;
        }
        #debugDiv {
          position: sticky;
          bottom: 0;
          padding: 1px 0;
          background: #eee;
        }

        #editor:focus {
          outline: 0px solid transparent;
        }
    </style>
    <title>CN-Editor</title>
</head>
<body>
    <div id="editor">
       
    </div>
    <div id="debugDiv">

    </div>
    <script>
        (function(doc) {
            var editor = document.getElementById('editor');
            var debugDiv = document.getElementById('debugDiv');
            // editor.contentEditable = true;
            editor.contentEditable = false;

            var scrollToBottomObserver = () => {
              debugDiv.append('<p>scrollToBottomObserver triggered</p>');
              editor.scrollTop = editor.offsetTop;
            }

            // Create an observer and pass it a callback.
            //var observer = new MutationObserver(scrollToBottomObserver);

            // Tell it to look for new children that will change the height.
            var config = {childList: true};
            //observer.observe(editor, config);

            var getSelectedStyles = () => {
                let styles = [];
                document.queryCommandState('bold') && styles.push('bold');
                document.queryCommandState('italic') && styles.push('italic');
                document.queryCommandState('underline') && styles.push('underline');
                document.queryCommandState('strikeThrough') && styles.push('lineThrough');

                const fColor = document.queryCommandValue('foreColor');
                const bgColor = document.queryCommandValue('backColor');
                const colors = {
                        color: fColor,
                        highlight: bgColor
                    };
                const stylesJson = JSON.stringify({
                    type: 'selectedStyles',
                    data: {styles, colors}});
                    sendMessage(stylesJson);
                

            }

            var sendMessage = (message) => {
              window.ReactNativeWebView.postMessage(message);
            }

            var getSelectedTag = () => {
                let tag = document.queryCommandValue('formatBlock');
                if(document.queryCommandState('insertUnorderedList'))
                    tag = 'ul';
                else if(document.queryCommandState('insertorderedlist'))
                    tag = 'ol';
                switch (tag) {
                    case 'h1':
                        tag = 'title';
                        break;
                        case 'h3':
                        tag = 'heading';
                        break;
                        case 'p':
                        tag = 'body';
                        break;
                    default:
                        break;
                }
                const stylesJson = JSON.stringify({
                    type: 'selectedTag',
                    data: tag});
                sendMessage(stylesJson);
            }

            document.addEventListener('selectionchange', () => {
                getSelectedStyles();
                getSelectedTag();
            });

            document.getElementById("editor").addEventListener("input", function() {
                let contentChanged = JSON.stringify({
                    type: 'onChange',
                    data: document.getElementById("editor").innerHTML });
                // scrollToBottom()
                sendMessage(contentChanged);
            }, false);

            var scrollToBottom = () => {
              //var div = document.getElementById('editor');
              // debugDiv.append('<p>Before scrollTop is called.</p>');
              // debugDiv.append('<p>ScrollTop is ' + document.documentElement.scrollTop + ' </p>');
              // document.documentElement.scrollTop = 4000;
              document.getElementById('debugDiv').scrollIntoView({
                behavior: 'smooth'
              });
              // debugDiv.append('<p>ScrollTop after is ' + document.documentElement.scrollTop + ' </p>');
              // editor.scrollTop = editor.scrollHeight - editor.clientHeight;
            };

            var onScroll = (e) => {
              debugDiv.append('<p>scrolling....</p>');
              debugDiv.append(e);
            }

            var applyToolbar = (toolType, value = '') => {
                switch (toolType) {
                    case 'bold':
                        document.execCommand('bold', false, '');
                        break;
                        case 'italic':
                        document.execCommand('italic', false, '');
                        break;
                        case 'underline':
                        document.execCommand('underline', false, '');
                        break;
                        case 'lineThrough':
                        document.execCommand('strikeThrough', false, '');
                        break;
                        case 'body':
                        document.queryCommandState('insertUnorderedList') && document.execCommand('insertUnorderedList');
                        document.queryCommandState('insertorderedlist') && document.execCommand('insertorderedlist');
                        document.execCommand('formatBlock', false, 'p');
                        break;
                        case 'title':
                        document.queryCommandState('insertUnorderedList') && document.execCommand('insertUnorderedList');
                        document.queryCommandState('insertorderedlist') && document.execCommand('insertorderedlist');

                        document.execCommand('formatBlock', false, 'h1');
                        break;
                        case 'heading':
                        document.queryCommandState('insertUnorderedList') && document.execCommand('insertUnorderedList');
                        document.queryCommandState('insertorderedlist') && document.execCommand('insertorderedlist');
                        document.execCommand('formatBlock', false, 'h3');
                        break;
                        case 'ol':
                        document.execCommand('formatBlock', false, 'p');
                        document.execCommand('insertorderedlist');
                        break;
                        case 'ul':
                        document.execCommand('formatBlock', false, 'p');
                        document.execCommand('insertUnorderedList');
                        break;
                        case 'color':
                        document.execCommand('foreColor', false, value);
                        break;
                        case 'highlight':
                        document.execCommand('backColor', false, value);
                        break;
                        case 'image':
                        var img = "<img src='" + value.url + "' id='" + value.id + "' width='" + Math.round(value.width) + "' height='" + Math.round(value.height) + "' alt='" + value.alt + "' />";
                         if(document.all) {
                             var range = editor.selection.createRange();
                             range.pasteHTML(img);
                             range.collapse(false);
                             range.select();
                           } else {
                             doc.execCommand("insertHTML", false, img);
                           }
                        break;
                        case 'link':
                        var anchorlink = "<a href='http://digg.com'>" + value.videoID + " at " + value.time + "</a>";
                          if(document.all) {
                            var range = editor.selection.createRange();
                            range.pasteHTML(anchorlink);
                            range.collapse(false);
                            range.select();
                          } else {
                            doc.execCommand("insertHTML", false, anchorlink);
                          }
                        break;
                    default:
                        break;
                }
                getSelectedStyles();
                getSelectedTag();
            }

            var getRequest = (event) => {
                 
              var msgData = JSON.parse(event.data);
              console.log(msgData);
              if(msgData.type === 'toolbar') {
                applyToolbar(msgData.command, msgData.value || '');
              }
              else if(msgData.type === 'editor') {
                switch (msgData.command) {
                case 'focus':
                  editor.focus();
                  break;
                case 'blur':
                  editor.blur();
                  break;
                case 'getHtml':
                  sendMessage(
                    JSON.stringify({
                    type: 'getHtml',
                    data: editor.innerHTML})
                    );
                  break;
                case 'setHtml':
                  editor.innerHTML = msgData.value;
                  break;
                case 'changeEditState':
                  editor.contentEditable = msgData.value;
                  editor.blur();
                  editor.focus();
                  break;
                default: break;
              }
            }
                 
                 
            };

            document.addEventListener("message", getRequest , false);
            window.addEventListener("message", getRequest , false);
            // window.addEventListener("scroll", onScroll, false);

            // debugDiv.append('<p>Debug started after scrollTo.</p>');
            
        })(document)
    </script>

</body>
</html>
`;

export default editorHTML;

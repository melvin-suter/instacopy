var setUsername;
var currentRoom = "Global";
var socket:any = undefined;

function delay(fn, ms) {
    let timer:any;
    return function(...args) {
      clearTimeout(timer)
    // @ts-ignore
        timer = setTimeout(fn.bind(this, ...args), ms || 0)
    }
  }

  
function startApp() {
    (document.querySelector('#content') as HTMLTextAreaElement).disabled = false;
    (document.querySelector('#button') as HTMLButtonElement).disabled = true;
    (document.querySelector('#room-id') as HTMLInputElement).disabled = true;
    let input = document.querySelector('#room-id') as HTMLInputElement;
    let content = document.querySelector('#content') as HTMLTextAreaElement;

    // @ts-ignore
    socket = io( (location.protocol == "https" ? 'wss' : 'ws') + '://',{
        secure: true,
        query: {
            roomID: input.value
        }
    });

    if(!socket) { return ;}
    
    socket.on('update',(data:any) => {
        content.value = data.content
    }); 

    socket.on('download', (data:any) => {

        const link = document.createElement( 'a' );
        link.style.display = 'none';
        document.body.appendChild( link );


        const blob = new Blob( [ data.content ], { type: data.mime } );	
        const objectURL = URL.createObjectURL( blob );
        
        link.href = objectURL;
        link.href = URL.createObjectURL( blob );
        link.download =  data.name;
        link.click();
    });

    socket.on('alert', (data:any) => {
        let html = '<div class="toast d-block align-items-center" role="alert" aria-live="assertive" aria-atomic="true">';
        html += '<div class="d-flex"><div class="toast-body">';
        html += data.message;
        html += '</div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>';
        
            (document.querySelector('.toasts') as HTMLDivElement).innerHTML += html;

        setTimeout(() => {
            (document.querySelector('.toast:first-child') as HTMLDivElement).remove();
        },3000);
    })

    document.querySelector('#content')?.addEventListener('keyup',delay(() => {
        console.log("emit " + content.value)
        socket.emit('update', {content: content.value })
    }, 1000));

    
    document.querySelector(".file-drop")?.addEventListener('drop',(ev:any) => {
        document.querySelector(".file-drop")?.classList.remove('hover');
        for(let file of ev.dataTransfer.files){
            socket.emit("upload", {name: file.name, mime: file.type, content: file}, (status) => {
                console.log(status);
            });
        }
        ev.preventDefault();
        ev.stopPropagation();
    });


    document.querySelector(".file-drop")?.addEventListener('dragenter', () => {
        document.querySelector(".file-drop")?.classList.add('hover');
    }, false)
    document.querySelector(".file-drop")?.addEventListener('dragleave', () => {
        document.querySelector(".file-drop")?.classList.remove('hover');
    }, false)

    document.querySelector(".file-drop")?.classList.remove('disabled');
}


document.getElementById('button')?.addEventListener('click',(ev:any) => {
    startApp();
});



document.querySelector('#room-id')?.addEventListener('keyup',(ev:any) => {
    if(ev.code == "Enter") {
        startApp();
    }
});

document.querySelector(".file-drop")?.addEventListener('dragover',(ev:any) => {
    ev.preventDefault();
    ev.stopPropagation();
});




document.addEventListener('click', (ev:any) => {

    let input = ev.target.closest(".btn-close");
    if(input){
        input.closest(".toast").remove();
    }

});

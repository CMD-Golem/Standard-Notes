// https://randombits.dev/standard-notes/component-relay

var el_name = document.getElementById("name");
var el_owner = document.getElementById("owner");
var el_container = document.getElementById("container");
var component_relay = new ComponentRelay({targetWindow:window, options:{coallesedSaving:true, coallesedSavingDelay:400}});
var current_note;

// load data
component_relay.streamContextItem((note) => {
	current_note = note;
	if (note.isMetadataUpdate) return;
	else if (current_note.content.text == "") upload();
	else if (!component_relay.getItemAppDataValue(note, 'locked')) {
		// allow editing of elements
		el_name.contentEditable = true;
		el_owner.contentEditable = true;
		el_name.addEventListener("keyup", saveNote);
		el_owner.addEventListener("keyup", saveNote);
		el_container.addEventListener("click", upload)
	}

	console.log(component_relay.getItemAppDataValue(note, 'locked'))
	console.log(note.content.text)

	// show data
	current_note = JSON.parse(note.content.text || "");
	
	el_name.innerHTML = current_note.name || "Name";
	el_owner.innerHTML = current_note.owner || "Owner";
	el_container.innerHTML = current_note.img || "";
});


// upload new image
function upload() {
	var import_element = document.createElement('input');
	import_element.type = 'file';
	import_element.accept = '.svg';

	import_element.addEventListener("change", (e) => {
		var reader = new FileReader();
		reader.readAsText(e.target.files[0],'UTF-8');
		reader.onload = readerEvent => {
			var img = readerEvent.target.result;
			container.innerHTML = img;
			current_note.img = img;

			component_relay.saveItemWithPresave(current_note);
		}
	});

	import_element.trigger("click");
}

// save Text change
function saveNote() {
	current_note.name = el_name.innerHTML;
	current_note.owner = el_owner.innerHTML;

	component_relay.saveItemWithPresave(current_note);
}
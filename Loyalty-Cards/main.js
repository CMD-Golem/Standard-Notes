// https://randombits.dev/standard-notes/component-relay

var el_name = document.getElementById("name");
var el_owner = document.getElementById("owner");
var el_container = document.getElementById("container");
var component_relay = new ComponentRelay({targetWindow:window, options:{coallesedSaving:true, coallesedSavingDelay:400}});
var default_json = '{"name":"Name", "owner":"Owner", "img":""}';
var locked = false;
var current_note;

// load data
component_relay.streamContextItem((note) => {
	current_note = note;

	// disable editing when locked
	if (!locked && component_relay.getItemAppDataValue(current_note, 'locked') == true) {
		locked = true;
		el_name.contentEditable = "false";
		el_owner.contentEditable = "false";
		el_name.removeEventListener("keyup", saveNote);
		el_owner.removeEventListener("keyup", saveNote);
		el_container.removeEventListener("click", upload);
	}

	// dont reload on metadata updates
	if (current_note.isMetadataUpdate) return;

	// enable editing
	else if (component_relay.getItemAppDataValue(current_note, 'locked') != true) {
		locked = false;
		// allow editing of elements
		el_name.contentEditable = "plaintext-only";
		el_owner.contentEditable = "plaintext-only";
		el_name.addEventListener("keyup", saveNote);
		el_owner.addEventListener("keyup", saveNote);
		el_container.addEventListener("click", upload);
	}

	// show data
	note_object = JSON.parse(current_note.content.text || default_json);
	
	el_name.innerHTML = note_object.name;
	el_owner.innerHTML = note_object.owner;
	el_container.innerHTML = note_object.img;
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
			el_container.innerHTML = img;

			note_object = JSON.parse(current_note.content.text || default_json);
			note_object.img = img;
			current_note.content.text = JSON.stringify(note_object);
			component_relay.saveItemWithPresave(current_note);
		}
	});

	import_element.click();
}

// save Text change
function saveNote() {
	note_object = JSON.parse(current_note.content.text || default_json);
	note_object.name = el_name.innerHTML;
	note_object.owner = el_owner.innerHTML;
	current_note.content.text = JSON.stringify(note_object);

	component_relay.saveItemWithPresave(current_note);
}
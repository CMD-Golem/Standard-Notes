// https://randombits.dev/standard-notes/component-relay

var el_owner = document.getElementById("owner");
var el_container = document.getElementById("container");
var component_relay = new ComponentRelay({targetWindow:window, options:{coallesedSaving:true, coallesedSavingDelay:400}});
var locked = false;
var current_note;

// load data
component_relay.streamContextItem((note) => {
	current_note = note;

	// disable editing when locked
	if (!locked && component_relay.getItemAppDataValue(current_note, 'locked') == true) {
		locked = true;
		el_owner.contentEditable = "false";
		el_owner.removeEventListener("keyup", saveNote);
		el_container.removeEventListener("click", upload);
	}

	// dont reload on metadata updates
	if (current_note.isMetadataUpdate) return;

	// enable editing
	else if (component_relay.getItemAppDataValue(current_note, 'locked') != true) {
		locked = false;
		// allow editing of elements
		el_owner.contentEditable = "true";
		el_owner.addEventListener("keyup", saveNote);
		el_container.addEventListener("click", upload);
	}

	// show data
	el_owner.innerHTML = current_note.content.preview_plain || "Owner";
	el_container.innerHTML =current_note.content.text || "";
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
			current_note.content.text = img;
			component_relay.saveItemWithPresave(current_note);
		}
	});

	import_element.click();
}

// save Text change
function saveNote() {
	current_note.content.preview_plain = el_owner.innerHTML;
	component_relay.saveItemWithPresave(current_note);
}
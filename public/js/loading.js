/**
 * Called for each AJAX call.
 */

jQuery( function() {
    // create the loading window and set autoOpen to false
    $('#loading').dialog({
        autoOpen: false,
        dialogClass: 'loading-screen-window',
        closeOnEscape: false,
        draggable: false,
        width: 400,
        minHeight: 50,
        modal: true,
        buttons: {},
        resizable: false,
        open: function() {
            // scrollbar fix for IE
            $('body').css( 'overflow', 'hidden' );
        },
        close: function() {
            // reset overflow
            $('body').css( 'overflow', 'auto' );
        }
    }); // end of dialog
});

/**
 * Show loading dialog, you can set the dialog title or message
 */

function showLoading() {
    $('#loading').html( 'Please wait...' );
    $('#loading').dialog( 'option', 'title', 'Loading' );
    $('#loading').dialog( 'open' );
}

/**
 * Close the dialog when the loading is complete.
 */
function closeLoading() {
    $('#loading').dialog( 'close' );
}

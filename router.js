var routes = require('./routes/index');

/**
 * Create all of the Express routes. This should contain the entire public API
 * with all REST references.
 */
exports.setup = function( app ) {

    app.get('/', routes.index);
    app.get('/finetune', routes.finetune)
    
    app.get('/textcompletion', routes.testcompletion)
    app.get('/summary', routes.summary)
    app.get('/make', routes.makeIndexFile)
    app.get('/question_answer', routes.question_answer)
};
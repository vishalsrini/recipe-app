const express = require('express');
const morgan = require('morgan');
const http = require('https');

const app = express();

const spoonacular = 'https://api.spoonacular.com';
const apiKey = '74926491f91048aebc7b31ed6ae2432d';

app.listen(process.env.PORT || 5000, () => {
    console.log('Server running on port 5000');
});

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('combined'));

app.get('/', (req, res) => {
    return res.status(200).json({
        status: 200,
        message: 'application working fine'
    })
})

app.post('/getrecipe', (req, res) => {
    console.log(req.body);

    let ingredients = '';
    for(let ingredient of req.body.queryResult.parameters.ingredient) {
        ingredients += ingredient + ",";
    }
    console.log('Ingredients used - ' , ingredients);
    
    const getRecipeUrl = encodeURI(`${spoonacular}/recipes/complexSearch/?apiKey=${apiKey}&cusine=indian&fillIngredients=true&diet=vegetarian&includeIngredients=${ingredients.slice(0,-1)}&number=2&limitLicense=true`);
    http.get(getRecipeUrl, responseFromApi => {
        let completeResponse = '';
        responseFromApi.on('data', chunk => {
            completeResponse += chunk;
        })
        responseFromApi.on('end', () => {
            // Add complete response object as a recipe
            const recipe = JSON.parse(completeResponse);

            console.log(recipe);

            let dataToSend = '';

            if(recipe.totalResults = 0) {
                dataToSend = `We couldn't find the recipe using the ingredients you mentioned.`;
            }

            let finalListOfRecipes = '';
            for(const [i, result] of recipe.results.entries()) {
                console.log(i, result.usedIngredients.length, result.unusedIngredients.length);
                var resultIngredient = '';
                var ingredients = result.usedIngredients.concat(result.unusedIngredients).concat(result.missedIngredients);
                for(const ingredient of ingredients) {
                    resultIngredient += ingredient.name + ",";
                }
                console.log('Full ingredients ', resultIngredient.toString());
                finalListOfRecipes += i+1 + '. ' + result.title + ' using following ingredients - ' + resultIngredient.slice(0,-1) + ' \n '
                if(i == (recipe.results.length-1)) {
                    dataToSend = `You can make following recipes \n ${finalListOfRecipes}. Want to know more on how to make that recipe?`
                    return res.json({
                        fulfillmentText: dataToSend,
                        source: 'getrecipe'
                    })
                }
            }
        })
    }, error => {
        return res.json({
            fulfillmentText: 'Could not get results at this time',
            source: 'getrecipe'
        })
    })


})
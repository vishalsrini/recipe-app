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

app.post('/getrecipe', (req, res) => {
    console.log(req.body);
    const getRecipeUrl = encodeURI(`${spoonacular}/recipes/complexSearch/?apiKey=${apiKey}&cusine=indian&diet=vegetarian&includeIngredients=${req.body.result.parameters.ingredient}&number=2&limitLicense=true`);
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

            dataToSend = `I think you can create ${recipe.results[0].title} using ${recipe.results[0].usedIngredientCount} ingredient that you mentioned. Want to know more on how to make that recipe?`

            return res.json({
                fulfillmentText: dataToSend,
                source: 'getrecipe'
            })
        })
    }, error => {
        return res.json({
            fulfillmentText: 'Could not get results at this time',
            source: 'getrecipe'
        })
    })


})
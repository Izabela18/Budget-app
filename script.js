//BUDGET CONTROLLER
var budgetController = (function() {

    //function constructor
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;//it cannot be divided by 0
    };
//adding method() calPercentage, counts % of totalincome spent->individual exp
Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
        this.percentage = -1;
    }
    
};
//seperate method to return calculated percentage
Expense.prototype.getPercentage = function() {
    return this.percentage;
};


 //function constructor
 var Saving = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentageSav = -1;
    
};

Saving.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
        this.percentageSav = Math.round((this.value / totalIncome) * 100);
    } else {
        this.percentageSav = -1;
    }
    
};

Saving.prototype.getPercentage = function() {
    return this.percentageSav;
};


var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
};

var data = {
    allItems: {
        exp: [],
        inc: [],
        sav: []
    },
    totals: {
        exp: 0,
        inc: 0,
        sav: 0
    },
    budget: 0,
    percentage: -1,
    percentageSav: -1

};

var calculateTotal = function(type) {

    var sum = 0;
    //adding values either to exp or inc
    data.allItems[type].forEach(function(cur) {
        sum += cur.value;

    });
    data.totals[type] = sum;

};
        
return {
    addItem: function(type, des, val) {
        var newItem, ID;

        if(data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length -1].id + 1;
        } else {
            ID = 0;
        }

    //creating new item ('inc' or 'exp' or 'sav')

        if(type === 'exp') {
            newItem = new Expense(ID, des, val);
        } else if (type === 'inc') {
            newItem = new Income(ID, des, val);
        } else if (type === 'sav') {
            newItem = new Saving (ID, des, val);
        }
        //push it to data
        data.allItems[type].push(newItem);

        return newItem;
        
    },

    deleteItem: function(type, id) {
        var ids, index;

        //e.g ids = [1, 2, 4, 6, 8], we want to delete id = 6
        //index = 3
        //data.allItems[type][id];

        //new array needs to be created with map() to delete the correct id
         ids = data.allItems[type].map(function(current){
            return current.id;
         });

         //indexOf() method returns the position of the first occurrence of a specified value in a string
         index = ids.indexOf(id);
         //splice() method changes the contents of an array by removing or replacing existing 
         if ( index !== -1) {
             data.allItems[type].splice(index, 1);
         }

    },

    calculateBudget: function() {

        // calculate total income, expenses and savings
        calculateTotal('exp');
        calculateTotal('inc');
        calculateTotal('sav');
        
        // Calculate the budget available: income - (expenses + savings)
        data.budget = (data.totals.inc) - (data.totals.exp + data.totals.sav);
        
        // calculate the percentage of income that we spent
        if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            data.percentageSav = Math.round((data.totals.sav / data.totals.inc) * 100);
        } else {
            data.percentage = -1;
            data.percentageSav = -1;
        }            
        
        // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 * 100

        
    },

    //calc % for each instance of exp

    calculatePercentages: function() {
       
        
        data.allItems.exp.forEach(function(cur) {
            //calPercentage() from Expenese.prototype
            cur.calcPercentage(data.totals.inc);
         });

    },

    calculatePercentagesSav: function() {
       
        
        data.allItems.sav.forEach(function(cur) {
            //calPercentage() from Saving.prototype
            cur.calcPercentage(data.totals.inc);
         });

    },

    //return all perc
    getPercentages: function() {
        var allPerc = data.allItems.exp.map(function(cur){
            //getPercentage->from Expense.prototype
            return cur.getPercentage();
        });
        return allPerc;
    },

    getPercentagesSav: function() {
        var allPerc = data.allItems.sav.map(function(cur){
            //getPercentage->from Saving.prototype
            return cur.getPercentage();
        });
        return allPerc;
    },
    //return all data with properties defined before in var data
    getBudget: function() {
        return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            totalSav: data.totals.sav,
            percentage: data.percentage,
            percentageSav: data.percentageSav

        };
    },

    testing: function() {
        console.log(data);
    }


};

})();

var UIController = (function() {
//retrieve all valid classes from HTML file
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        savingsContainer: '.savings__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        savingsLabel: '.budget__savings--value',
        percentageLabel: '.budget__expenses--percentage',
        percentageSavingsLabel: '.budget__savings--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        savingsPercLabel: '.saving__percentage',
        dateLabel: '.budget__title--month',
        

    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;

         /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands*/
        
        //Math.abs() function returns the absolute value of a number (without - or +)
        num = Math.abs(num);
        //toFixed() method formats a number using fixed-point notation, to 2 decimal points

        num = num.toFixed(2);

        numSplit = num.split('.');//splits the string number with .

        int = numSplit[0];

        //substr() method returns a portion of the string, starting at the specified index and extending for a given number of characters afterward
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length -3, 3);
        }

        dec = numSplit[1];

        //display - or + sign before numbers
        return (type === 'exp' ? '-': type === 'inc' ? '+' : ' ') + ' ' + int + '.' + dec;


    };
    //declare function that loops through lists and can be later reused
    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }

    };


    return {
        //getting input values from DOMstrings
        getInput: function() {
            return {
                type:document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                //parses string and returns float number
                value:parseFloat(document.querySelector(DOMstrings.inputValue).value)

            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element, date;

            //create HTML with placeholder text

            if( type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (type === 'sav') {
                element = DOMstrings.savingsContainer;

                html = '<div class="item clearfix" id="saving-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="saving__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }
            //replace placeholder with real input
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
        
            
            
            //insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


            
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            //delete child by reference to the parent
            el.parentNode.removeChild(el);

        },

        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            //convert strings to array
            fieldsArr = Array.prototype.slice.call(fields);
            //input field blank
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },

       

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp' || 'sav';
            //.textContent returns string or null
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.savingsLabel).textContent = formatNumber(obj.totalSav, 'sav');

            if(obj.percentage || obj.percentageSav > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
                document.querySelector(DOMstrings.percentageSavingsLabel).textContent = obj.percentageSav + '%';

            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '---';
                document.querySelector(DOMstrings.percentageSavingsLabel).textContent = obj.percentageSav + '---';

            }

        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            //it takes a list of expenses and calculates the % for each
            nodeListForEach(fields, function(current, index) {

                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            });

        },

        displayPercentagesSav: function(percentagesSav) {

        var fieldsSav = document.querySelectorAll(DOMstrings.savingsPercLabel);
            //it takes a list of savings and calculates the % for each
            nodeListForEach(fieldsSav, function(current, index) {

                if(percentagesSav[index] > 0) {
                    current.textContent = percentagesSav[index] + '%';
                } else {
                    current.textContent = '---';
                }

            });

        },

        displayMonth: function() {
            var now, months, month, year;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            //calling methods on Date prototype object
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;


        },

        



       
        //change color of input fields between red and blue when type is clicked (- or +)
        changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function() {
            return DOMstrings;
        }



    };
})();


//GLOBAL APP CONTROLLER
//controls data flow between budgetController and UIController

var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function() {

        //take function returned from UIController
        var DOM = UICtrl.getDOMstrings();

        //events for  add, delete and change type

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        //when enter is clicked
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        //.container->event delegation, deleting event spreads up to the main div
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updateBudget = function() {

        //1.calculate budget -> calculateBudget() from budgetController
        budgetCtrl.calculateBudget();

        //2. getBudget() -> from budgetController(), it returns budget
        var budget = budgetCtrl.getBudget();

        //3.display budget on UI, displayBudget() from UIController
        UICtrl.displayBudget(budget)

    };

    var updatePercentages = function() {

        //1. calculate percentages, calculatePercentages() from budgetController()
        budgetCtrl.calculatePercentages();
        budgetCtrl.calculatePercentagesSav();

        //2.getPercentages() returned from budgetController
        var percentages = budgetCtrl.getPercentages();
        var percentagesSav = budgetCtrl.getPercentagesSav();

        //3. update the UI with new percs, displayPercentages() from UIController()
        UICtrl.displayPercentages(percentages);
        UICtrl.displayPercentagesSav(percentagesSav);

    };

    var ctrlAddItem = function() {
        var input, newItem;

        //1. get the fields input data from UIController
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
            
            // 6. Calculate and update percentages
            updatePercentages();
        }



    };
    //event listeners have event as an argument
    var ctrlDeleteItem = function(event) {
      var itemID, splitID, type, ID;

      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

      if(itemID) {
        //split() is a method that splits strings into array of strings
        splitID = itemID.split('-');
        type = splitID[0];//inc or exp
        ID = parseInt(splitID[1]);//it it string so needs to be changed to int
      

        //1.delete the item from data structure
        budgetCtrl.deleteItem(type, ID);

        //2. delete the item from the UI
        UICtrl.deleteListItem(itemID);

        //3. update and show the new budget
        updateBudget();

        //4. update percentages
        updatePercentages();
      }
    };

    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                totalSav: 0,
                percentage: -1,
                percentageSav: -1

            });
            setupEventListeners();
        }

    };



})(budgetController, UIController);

controller.init();
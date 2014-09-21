function ParseQuery(query){
    this.query = query;
    this.setVal = function(val){
        var temp = this.query;
        var nval = " '"+val+"' ";
        temp = temp.replace("?",nval);
        this.query = temp;
    };
    this.getQuery = function(){
        return this.query;
    };
}
module.exports.ParseQuery = ParseQuery;
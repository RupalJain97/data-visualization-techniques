
d3.select("#show_a01").on("click", function () {
    d3.select("#assign1").attr("hidden", null);
});
d3.select("#hide_a01").on("click", function () {
    d3.select("#assign1").attr("hidden", true);
});


d3.select("#show_a02").on("click", function () {
    d3.select("#assign2").attr("hidden", null);
});
d3.select("#hide_a02").on("click", function () {
    d3.select("#assign2").attr("hidden", true);
});


d3.select("#show_a03").on("click", function () {
    d3.select("#assign3").attr("hidden", null);
    main_a03();
});
d3.select("#hide_a03").on("click", function () {
    d3.select("#assign3").attr("hidden", true);
    d3.select("#div1_a03").html("");
    d3.select("#colorLegend").html("");
    d3.select("#colorLegend").append("select").attr("id", "columns");
});


d3.select("#show_a04").on("click", function () {
    d3.select("#assign4").attr("hidden", null);
});
d3.select("#hide_a04").on("click", function () {
    d3.select("#assign4").attr("hidden", true);
});


d3.select("#show_a05").on("click", function () {
    d3.select("#assign5").attr("hidden", null);
});
d3.select("#hide_a05").on("click", function () {
    d3.select("#assign5").attr("hidden", true);
});


d3.select("#show_a06").on("click", function () {
    d3.select("#assign6").attr("hidden", null);
});
d3.select("#hide_a06").on("click", function () {
    d3.select("#assign6").attr("hidden", true);
});
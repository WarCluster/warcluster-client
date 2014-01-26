showIndividualLeaderboard = function(e){
  // $("#leaderboardPage").animate({top: 0},{ 
  //     duration: "slow", 
  //     easing: "easeOutBounce"
  //   });
  $("#individual").show();
  $("#team").hide();
}
showTeamLeaderboard = function(e){
  $("#individual").hide();
  $("#team").show();
}

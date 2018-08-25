var pType ;

function transitForms(elem) {
	$(elem).closest('.card-body').find('#err').hide();
	$(elem).closest('.card-body').find('#regSucc').hide();
}

$(document).on('click', '#close_error', function() {
	$(this).parent().hide();
});

$(document).on('click', '#signUpLink', function() {
	var elem = this;
	$(elem).closest('.card-body').find('#inputLoginFeilds').hide();
	$(elem).closest('.card-body').find('#inputRegisterFeilds').show();
	transitForms(elem);
});

$(document).on('click', '#logInLink', function() {
	var elem = this;
	$(elem).closest('.card-body').find('#inputLoginFeilds').show();
	$(elem).closest('.card-body').find('#inputRegisterFeilds').hide();
	transitForms(elem);
});

$(document).on('click', '#showReplyBtn', function(){
		$(this).hide();
		$(this).parent().find("p#replyText").show();
});

$(document).on('click', '.sResultsMain', function() {
	var outletId = $(this)[0].dataset.outletid;
	getReviewsById(outletId, $(this).find('#restaurantName').text());
	$(this).find('#userCommentRating').show();
	$(this).find('#restaurantUtilities').show();
	$(this).find('#restaurantExReview').show();
	$(this).find('#resultmessage').hide();
});

$(document).on('click', '#reviewPost', function(){
	var parentElem = $(this).closest('.sResultsMain');

	var outletId = $(parentElem)[0].dataset.outletid;

	var reviewComment = $(this).closest('#restaurantUtilities').find('td #replyPostText').val();
	var reviewRating = $(parentElem).find('#userCommentRating').find('ul#stars').find('li.star.selected').length;

	var reviewObj = new Object({
		rating : reviewRating,
		comment : reviewComment
	});
	putReview(outletId, reviewObj, parentElem, updateOutletInfo, function(err, res){
		if(err){
			showReviewPostError(err, parentElem);
		}
		else{
			showReviewPostSuccess(res, parentElem);
		}
	});
});

$(document).on('click', '#deleteOutlet', function(){
	deleteOutlet($(this).closest('.sResultsMain'));
});

$(document).on('click', '#deleteReview', function(){
	deleteReview($(this).closest('.sResultsMain'));
});

$(document).on('click', '#postReply', function(){
	console.log($('.mineNameHeader'));
	console.log($(this).closest('.reviewList li'));

	parentElem = $(this).closest('.reviewList li');
	var outletId = $('.mineNameHeader')[0].dataset.outletid;
	var reviewId = $(this).closest('li')[0].dataset.reviewid;
	console.log(outletId, reviewId);
	var reply = $(this).closest('.showReplyDiv').find('#replyPostText').val();

	var param = {
		reply : reply
	}
	console.log(param);

	$.ajax({
		type : 'PUT',
		url : 'outlet/reply/'+ outletId + '/' +reviewId,
		data : param,
		statusCode : {
			200 : function(res){
				showSuccess(res.message);
				$(parentElem).fadeOut(function(){
					setTimeout(function(){
						$(parentElem).remove();
					}, 500);
				});
			},
			400 : function(res){
				console.log(res.responseJSON.message);
			},
			401 : function(res){
				showError(res.responseJSON.message);
			},
			500 : function(res){
				showError(res.responseJSON.message)
			}
		}
	})
})

(function toggleFilterBtn() {
	$("#fScore").click(function() {
		$(this).parent().find("ul.dropdown-menu").toggle();
	});
})();

(function filterDivToggle(){
	$('ul.dropdown-menu').click(function(){
		$(this).hide();
	})
})();

(function filterScore() {
	var stars;

	function rmActiveAttr(fBtn) {
		//remove active attributes from all the button
		fBtn.closest($(".dropdown-menu")).find($(".fBtn")).each(function(index) {
			$(this).find($(".fa.fa-chevron-circle-right")).removeClass("fBtnActive");
		});
	};


	function preLoader() {
		//To improve the user experience add the loader for showig the users that it has been filtered
		$(".sResultsMain").hide();
		$("#loader_divFilter").show();
		setTimeout(function() {
			$(".sResultsMain").show();
			$("#loader_divFilter").hide();
		}, 500);
	};

	function filter(fBtn, rating) {
		var list = new Array();
		$('.sResultsMain').each(function(){
			var listObj = new Object();
			listObj.avgRating = Number($(this).find('#avgRating').text());
			listObj.div = this;
			list.push(listObj);
		});
		list = sortListRating(list);
		$('.restaurantLists').html('');
		for(var each in list){
			$(list[each].div).prependTo('.restaurantLists');
		}
		starRating();

		preLoader();

		//if filter applied, then remove the funnel icon and add the double tick icon
		fBtn.closest($(".dropdown")).find($("#fScore .ionicons.ion-funnel")).remove();
		if (fBtn.closest($(".dropdown")).find($("#fScore .ionicons.ion-android-done-all")).length == 0) {
			fBtn.closest($(".dropdown")).find($("#fScore")).append("<i class='ionicons ion-android-done-all'></i>");
		}
		rmActiveAttr(fBtn);

		fBtn.find($(".fa.fa-chevron-circle-right")).addClass("fBtnActive");
		var counterNotShown = 0;
		var	counterShown = 0;
		$(".sResultsMain").find($(".sResultBox")).each(function() {
			stars = Number($(this).find('#avgRating').text());
			if (stars < rating) {
				$(this).fadeOut();
				counterNotShown++;
			}
			if (stars >= rating) {
				$(this).fadeIn();
				counterShown++;
			}
		});
		fBtn.closest($("#recentSearch")).find($("#numberResults")).text("Showing " + counterShown + " results");
	};

	function rmFilter(fBtn) {
		//To improve the user experience add the loader for showig the users that it has been filtered
		preLoader();
		//if filter is not applied, then remove the double tick icon and add the double tick icon
		fBtn.closest($(".dropdown")).find($("#fScore .ionicons.ion-android-done-all")).remove();
		if (fBtn.closest($(".dropdown")).find($("#fScore .ionicons.ion-funnel")).length == 0) {
			fBtn.closest($(".dropdown")).find($("#fScore")).append("<i class='ionicons ion-funnel'></i>");
		}
		rmActiveAttr(fBtn);
		//display all the results
		$(".sResultsMain").find($(".sResultBox")).each(function() {
			if ($(this).css("display") == "none")
				$(this).fadeIn();
		});
		var totalResults = $(".sResultsMain").find($(".sResultBox")).length;
		fBtn.closest($("#recentSearch")).find($("#numberResults")).text("Showing " + totalResults + " results");
	};

	function hideRmFilter() {
		if ($(".dropdown-menu").find($(".fBtnActive")).length != 0) {
			$(".dropdown-menu").find("#rmFilterDiv").show();
		} else {
			$(".dropdown-menu").find("#rmFilterDiv").hide();
		}
	};

	hideRmFilter();

	$(document).click(function() {
		hideRmFilter();
	});

	$("#fourUpRate").click(function() {
		filter($(this), 4);
	});

	//Show only those reuslts that are three stars and up
	$("#threeUpRate").click(function() {
		filter($(this), 3);
	});

	//Show only those reuslts that are two stars and up
	$("#twoUpRate").click(function() {
		filter($(this), 2);
	});

	//Show only those reuslts that are one stars and up
	$("#oneUpRate").click(function() {
		filter($(this), 1);
	});

	//Show only those reuslts that are one stars and up
	$("#removeFilter").click(function() {
		rmFilter($(this));
	});

})();

(function register() {
	$('#registerBtn').click(function() {
		//Clear previously set values
		param = new Object({
			name: DOMPurify.sanitize($('#inputRegisterFeilds input[name=name]').val()),
			username: DOMPurify.sanitize($('#inputRegisterFeilds input[name=username]').val()),
			password: DOMPurify.sanitize($('#inputRegisterFeilds input[name=password]').val()),
			cnfpassword: DOMPurify.sanitize($('#inputRegisterFeilds input[name=cnfpassword]').val()),
			pType: DOMPurify.sanitize($('#inputRegisterFeilds select[name=pType]').val())
		});

		$.ajax({
			type: 'POST',
			url: '/user/register/',
			data: param,
			success: function(data) {
				$("#inputRegisterFeilds").hide();
				$("#inputLoginFeilds").show();
				showLoginSuccess(data.message);
			},
			statusCode: {
				400: function(res) {
					var data = res.responseJSON;
					showLoginError(data.message);
					for (var ech in data.errors) {
						$("#inputRegisterFeilds input[name=" + data.errors[ech].param + "]").val("");

						$("#inputRegisterFeilds input[name=" + data.errors[ech].param + "]").attr("placeholder", data.errors[ech].msg);
						$("#inputRegisterFeilds input[name=" + data.errors[ech].param + "]").css({
							"border": "1px solid #bfbfbf"
						});
					}
				},
				401: function(res) {
					showLoginError(res.responseJSON.message);
				}
			}
		});
	});
})();

function InitailzeDisplay(refreshBool, res){
	if(refreshBool==0){
		pType = res.priority;
		if(res.priority==2)
			getOutletList(res._id);
		else
			getOutletList("");
	}
	else {
		// To be completed
		$.ajax({
			type : 'GET',
			url : 'userInfo',
			statusCode : {
				400 : function(res){
					console.log(res.responseJSON.message);
				},
				200 : function(res){
					pType = res.details.priority;
					if(res.details.priority==2){
						getOutletList(res.details._id);
					}
					else {
						getOutletList("");
					}
				}
			}
		});
	}
};

(function logIn() {
	$('#logInBtn').click(function() {
		param = new Object({
			username: DOMPurify.sanitize($('#inputLoginFeilds input[name=username]').val()),
			password: DOMPurify.sanitize($('#inputLoginFeilds input[name=password]').val())
		});
		console.log(param);
		$.ajax({
			type: 'POST',
			data: param,
			url: '/user/login',
			statusCode: {
				200 : function(res){
					$('.logInDisplay').remove();
					$('.indexPage').fadeIn();
					//can be admin-94321, user-1, owner-2
					InitailzeDisplay(0, res.details);
				},
				400 : function(res){
					showLoginError(res.responseJSON.message);
				},
				401 : function(res) {
					showLoginError(res.responseJSON.message);
				}
			}
		});
	});
})();

(function logOut() {
	$('#logoutBtn').click(function() {
		$.ajax({
			type: 'GET',
			url: '/user/logout',
			success: function(data) {
				location.reload();
			},
			statusCode: {
				401: function(res) {
					showError(res.responseJSON.message);
					location.reload();
				}
			}
		})
	});
})();

(function toggleRestSaveDiv() {
	$(".showReply#restSaveShowBtn").click(function() {
		$(this).closest("#recentSearch").find(".restSaveDiv").fadeToggle("slow");
	});
})();

function starRating() {
	/* 1. Visualizing things on Hover - See next part for action on click */
	$('#stars li').on('mouseover', function() {
		var onStar = parseInt($(this).data('value'), 10); // The star currently mouse on

		// Now highlight all the stars that's not after the current hovered star
		$(this).parent().children('li.star').each(function(e) {
			if (e < onStar) {
				$(this).addClass('hover');
			} else {
				$(this).removeClass('hover');
			}
		});

	}).on('mouseout', function() {
		$(this).parent().children('li.star').each(function(e) {
			$(this).removeClass('hover');
		});
	});

	/* 2. Action to perform on click */
	var ratingVal = $('#stars li').on('click', function() {
		var onStar = parseInt($(this).data('value'), 10); // The star currently selected
		var stars = $(this).parent().children('li.star');

		for (i = 0; i < stars.length; i++) {
			$(stars[i]).removeClass('selected');
		}

		for (i = 0; i < onStar; i++) {
			$(stars[i]).addClass('selected');
		}
	});
};

function showLoginError(message) {
	$('.logInDisplay').find('#err b').text(message);
	$('.logInDisplay').find('#err').show();
	$('.logInDisplay').find('#regSucc').hide();
}

function showLoginSuccess(message) {
	$('.logInDisplay').find('#regSucc b').text(message);
	$('.logInDisplay').find('#err').hide();
	$('.logInDisplay').find('#regSucc').show();
}

function showError(message) {
	$('#recentSearch').find("#err b").text(message);
	$('#recentSearch').find('#err').show();
	$('#recentSearch').find('#regSucc').hide();
	setTimeout(function() {
		$('#recentSearch').find('#err').fadeOut();
	}, 3000);
}

function showSuccess(message) {
	$('#recentSearch').find("#regSucc b").text(message);
	$('#recentSearch').find('#regSucc').show();
	$('#recentSearch').find('#err').hide();
	setTimeout(function() {
		$('#recentSearch').find('#regSucc').fadeOut();
	}, 3000);
}

function sanitizationUtility(dirtyObj, callback) {
	cleanObj = new Object();
	for (var each in dirtyObj) {
		cleanObj[each] = DOMPurify.sanitize(dirtyObj[each], {
			SAFE_FOR_JQUERY: true
		});
		if (cleanObj[each] != dirtyObj[each])
			return callback(true, "XSS Validation Failed", null);
	}
	return callback(false, "Input Sanitized", cleanObj);
};

//preAppRe --> prepend(1), append(-1), replace(0)
function addOutletDiv(outletObj, parentElem, preAppRe) {

	var outletDiv =
		'<div class="sResultsMain" data-outletid='+ outletObj.uid +'>\
  	<div class="sResultBox">\
    <table>\
      <tbody>\
        <tr id="restaurantInfo">\
          <td>\
            <div id="restaurantHeading">\
              <p id="restaurantName">' + outletObj.name + '</p>\
              <button class="i ionicons ion-android-delete" id="deleteOutlet" type="button"></button>\
            </div>\
            <hr/>\
            <div id="details">\
              <p id="aboutUs">' + outletObj.desc + '</p>\
              <p id="address"> <i class="ionicons ion-location" style="padding-right:10px"></i>' + outletObj.addr + '</p>\
            </div>\
          </td>\
		      <td id="restaurantBigRating">\
            <p id="avgRating"> ' + outletObj.avgRating + ' </p>\
            <div class="rStats">\
              <div class="star-ratings-css">\
								<div class="star-ratings-css-top">'

								for(var i=0;i<outletObj.avgRating;i++){
								 outletDiv = outletDiv + '<span>★</span>';
							 }

								outletDiv = outletDiv + '</div>\
                <div class="star-ratings-css-bottom"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>\
              </div>\
            </div>\
            <p id="num_reviews">(' + outletObj.num_reviews + ' Reviews)</p>\
          </td>\
        </tr>\
				  </td>\
		</tr></tbody></table>'

		if(pType != 2){
						outletDiv = outletDiv + '<table id="restaurantExReview">\
								<tr style="width:100%;margin:0px;display:inline-flex">\
								<td style="padding-left:20px;float:left;min-width:50%;text-align:center">\
								<div class="rStats"><div class="star-ratings-css"><div class="star-ratings-css-top">';

						for(var i=0;i<outletObj.bestReview.rating;i++){
							outletDiv = outletDiv + '<span>★</span>'
						}

						outletDiv = outletDiv + '\
								</div><div class="star-ratings-css-bottom"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div></div></div>\
								<p id="pReviewText"><i class="fa fa-quote-left" style="padding-right:10px"></i>'+ outletObj.bestReview.comment +'\
								<p id="reviewerName">' + outletObj.bestReview.name + '</p></p>\
								</td>\
								<td id="sepRev">\
								<div class="rStats"><div class="star-ratings-css"><div class="star-ratings-css-top" style="color:red">';

						for(var i=0;i<outletObj.worstReview.rating;i++){
							outletDiv = outletDiv + '<span>★</span>'
						}

						outletDiv = outletDiv + '\
								</div><div class="star-ratings-css-bottom"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div></div></div>\
								 <p id="nReviewText"><i class="fa fa-quote-left" style="padding-right:10px"></i>' + outletObj.worstReview.comment + '\
								 <p id="reviewerName">' + outletObj.worstReview.name + '</p></p>\
								 </td>\
								 </tr>\
								 </table>\
								 <table>\
								<tbody>\
									<tr id="resultmessage">\
										<td style="float:left;width:100%">\
											<div class="alert alert-success" id="succReviewPost" style="margin-left:10px;margin-right:10px;">\<b>Success</b></div>\
											<div class="alert alert-danger" id="errReviewPost" style="margin-left:10px;margin-right:10px"><b>Error</b></div>\
										</td>\
									</tr>\
									<tr id="userCommentRating">\
										<td>\
											<p>Your rating : </p>\
										</td>\
										<td>\
											<section class="rating-widget">\
												<div class="rating-stars text-center">\
													<ul id="stars">\
														<li class="star" title="Poor" data-value="1">\
														<i class="fa fa-star fa-fw"></i>\
														</li>\
														<li class="star" title="Fair" data-value="2"><i class="fa fa-star fa-fw"></i>\
														</li>\
														<li class="star" title="Good" data-value="3"><i class="fa fa-star fa-fw"></i>\
														</li>\
														<li class="star" title="Excellent" data-value="4"><i class="fa fa-star fa-fw"></i>\
														</li>\
														<li class="star" title="WOW!!!" data-value="5"><i class="fa fa-star fa-fw"></i>\
														</li>\
													</ul>\
												</div>\
											</section>\
										</td>\
									</tr>\
									<tr id="restaurantUtilities">\
										<td style="float:left;width:80%">\
											<textarea id="replyPostText" name="replyPostText" placeholder="Write reivew..." required></textarea>\
										</td>\
										<td style="float:right;padding:5px">\
											<button id="reviewPost" type="button">Post</button>\
										</td>\
									</tr>\
								</tbody>\
							</table>';
		}

		outletDiv = outletDiv + '</div></div>';

	if(preAppRe==1){
		$(outletDiv).hide().prependTo(parentElem).fadeIn("slow");
	}
	else if(preAppRe==-1){
		$(outletDiv).hide().appendTo(parentElem).fadeIn("slow");
	}
	else {
		$(parentElem).html($(outletDiv).find('.sResultBox')).fadeIn("slow");
	}

	starRating();
}

function processDate(date){
	var d_names = new Array("Sunday", "Monday", "Tuesday",
	"Wednesday", "Thursday", "Friday", "Saturday");

	var m_names = new Array("January", "February", "March",
	"April", "May", "June", "July", "August", "September",
	"October", "November", "December");

	var d = new Date(date);
	var curr_day = d.getDay();
	var curr_date = d.getDate();
	var sup = "";
	if (curr_date == 1 || curr_date == 21 || curr_date ==31)
	   {
	   sup = "st";
	   }
	else if (curr_date == 2 || curr_date == 22)
	   {
	   sup = "nd";
	   }
	else if (curr_date == 3 || curr_date == 23)
	   {
	   sup = "rd";
	   }
	else
	   {
	   sup = "th";
	   }
	var curr_month = d.getMonth();
	var curr_year = d.getFullYear();
	var curr_hour = d.getHours();
	var curr_min = d.getMinutes();

	Day = ("Posted on " + curr_date + "<SUP>"
	+ sup + "</SUP> " + m_names[curr_month] + " at " + curr_hour + " : " + curr_min);
	return Day;
}

function addReviewsDiv(res, name, outletId){
	var reviewHeader = '<div style="position:fixed" class="reviewsDiv">\
  <div class="sResultsMine">\
    <div class="mineNameHeader" data-outletid='+outletId+'>\
      <div style="display:inline-flex;"></div>\
      <p id="outletname">'+ name +'</p>'

			if(pType!=2)
				reviewHeader = reviewHeader + '<p id="reviewLength">' + res.reviewList.length + ' Reviews</p>';

		reviewHeader = reviewHeader +'</div><div class="reviewList">';


	var reviewList="";

	for(each in res.reviewList){

		var element = res.reviewList[each];
		var posterName = element.customerName;
		var date = processDate(element.date);

		var reviewId = element._id;
		var rating = element.rating;
		var comment = element.comment;
		var reply = "";
		if(element.reply)
			reply = element.reply;

		var top = '<li data-reviewId='+ reviewId +'>\
	      <hr>\
	      <table id="reviewTableDiv">\
	        <tbody>\
	          <tr id="reviewInfoDiv">\
	            <td style="float:left;">\
	              <p id="reviewerName">'+ posterName +'</p>\
	              <p id="reviewDate">'+ date +'</p>\
	            </td>\
	            <td style="float:right;">\
							<div class="rStats"><div class="star-ratings-css">\
							<div class="star-ratings-css-top">';
							////console.lograting, typeof rating);
							for(var i=0;i<rating;i++){
							 top = top + '<span>★</span>';
						 }

							top  = top + '</div>\
							<div class="star-ratings-css-bottom">\
							<span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>\
							</div>\
							</div>\
							</div>\
							<button class="i ionicons ion-android-delete" id="deleteReview" type="button">\
							</button></td>\
	          </tr>\
	          <tr id="reviewTextDiv">\
	            <td>\
	              <table>\
	                <tbody>\
	                  <tr>\
	                    <td>\
											<i class="fa fa-quote-left"></i>\
	                      <p id="pReviewText"> '+ comment +'</p>\
	                    </td>\
	                  </tr>\
	                </tbody>\
	              </table>\
	            </td>\
	          </tr>';

	          var replyHeader = '<tr class="showReplyDiv">'

	          var replied  = '<td style="float:right">\
	              <button class="showReply" id="showReplyBtn" type="button">Show Reply</button>\
	              <p id="replyText" style="display:none"><span style="font-weight:500;font-size:15px"> Owner : ' + reply + '</p>\
	            </td>\
	          </tr>';

						var notReplied = '<td style="float:left;width:80%">\
						 										<textarea id="replyPostText" name="replyPostText" placeholder="Write your regards..." required />\
						 									<td style="float:right;">\
						 										<button id="postReply" type="button">Post</button></td>\
																</td>';

					var footerPart = '</tbody>\
	      </table>\
	    </li>';

			if(pType != 2){//Not an owner
				if(reply!=""){
					reviewList = reviewList + top + replyHeader + replied + footerPart;
				}
				else {
					reviewList = reviewList + top + footerPart;
				}
			}
		else{
			if(reply==""){
				reviewList = reviewList + top + replyHeader + notReplied + footerPart;
			}
		}
	}

	var reviewRemainder = '</div>\
	  </div>\
	</div>'

	var finalReviewDiv = reviewHeader + reviewList + reviewRemainder;
	if($('#mainResults').find('.reviewsDiv').length!=0)
		$("#mainResults").find('.reviewsDiv').replaceWith(finalReviewDiv);
	else {
		$(finalReviewDiv).appendTo("#mainResults");
	}
}

function getReviewsById(outletId, name){
	$.ajax({
		type : 'GET',
		url : '/outlet/reviews/'+outletId,
		statusCode : {
			200 : function(res) {
				addReviewsDiv(res, name, outletId);
			},
			400 : function(res){
				showError(res.responseJSON.message);
			}
		}
	});
};

function findOutletObj(outletObj){

			var cleanObj = new Object({
				uid: outletObj._id,
				name: outletObj.metadata.name,
				desc: outletObj.desc,
				addr: outletObj.addr,
				num_reviews : outletObj.reviews.length,
				reviews: outletObj.reviews
			});

			var bestReview = {
				comment : "No Positive Reviews",
				rating : 0,
				user : "",
				name : "",
			};
			var worstReview = {
				comment : "No Negetive Reviews",
				rating : 0,
				user : "",
				name : "",
			};
			var avgRating = 0;

			if (outletObj.reviews.length == 0) {
				cleanObj.bestReview = bestReview
				cleanObj.worstReview = worstReview;
				cleanObj.avgRating = 0;
			} else {
				worstReview.rating = 6;
				for(var each in outletObj.reviews){
					var elem = outletObj.reviews[each];
					avgRating = avgRating + elem.rating;
					if(bestReview.rating <= elem.rating){
						bestReview.rating = elem.rating;
						bestReview.comment = elem.comment;
						bestReview.user = elem.customerUserName;
						bestReview.name = "&#126; " + elem.customerName;
					}
					if(worstReview.rating >= elem.rating){
						worstReview.rating = elem.rating;
						worstReview.comment = elem.comment;
						worstReview.user = elem.customerUserName;
						worstReview.name = "&#126; " + elem.customerName;
					}
				}
				avgRating = Math.round(avgRating/outletObj.reviews.length);
				cleanObj.avgRating = avgRating;
				cleanObj.bestReview = bestReview;
				cleanObj.worstReview = worstReview;
				if(cleanObj.worstReview.rating == 6){
					cleanObj.worstReview.rating = 0;
				}
				if(cleanObj.worstReview.rating== cleanObj.bestReview.rating){
					cleanObj.worstReview.comment = "No Negetive Reviews";
					cleanObj.worstReview.rating = 0;
					cleanObj.worstReview.user = "";
					cleanObj.worstReview.name = "";
				}
			}
			return cleanObj;
}

function sortListRating(list){
	list = list.sort(function myComp(a,b){
		return (a.avgRating>b.avgRating)?1:(a.avgRating<b.avgRating)?-1:0;
	});
	return list;
}

function appendOutletList(data) {
	var Outlets = data.list;
	list = new Array()

	for (var outlet in Outlets) {
		var outletObj = Outlets[outlet];
		list.push(findOutletObj(outletObj));
	}
	list = sortListRating(list);
	for(each in list){
		addOutletDiv(list[each], $(".restaurantLists"), 1);
	}
}

function getOutletList(userId) {
	$.ajax({
		type: 'GET',
		url: '/outlet/'+userId,
		success: function(data) {
			appendOutletList(data);
		},
		statusCode: {
			401: function(res) {
				showError(res.responseJSON.message);
			}
		}
	});
};

function initOutletObj(param) {
	param.pExReview = "No Positive Reviews";
	param.pExReviewR = "0";
	param.nExReview = "No Negetive Reviews";
	param.nExReviewR = "0";
	param.avgRating = "0";
	return param;
}

function showReviewPostError(msg, elem){
	$(elem).find('#errReviewPost b').text(msg);
	$(elem).find('#errReviewPost').show();
	$(elem).find('#succReviewPost').hide();
	$(elem).find('#resultmessage').show();
	$(elem).find('#restaurantUtilities').show();
	$(elem).find('#userCommentRating').show();
	$(elem).find('#replyPostText').val('');
	$(elem).find('ul#stars li.star').removeClass('selected');
}

function showReviewPostSuccess(msg, elem){
	$(elem).find('#succReviewPost b').text(msg);
	$(elem).find('#errReviewPost').hide();
	$(elem).find('#succReviewPost').show();
	$(elem).find('#resultmessage').show();
	$(elem).find('#userCommentRating').hide();
	$(elem).find('#restaurantUtilities').hide();
	$(elem).find('#replyPostText').val('');
	$(elem).find('ul#stars li.star').removeClass('selected');
}

function updateOutletInfo(message, outletId, reviewObj, parentElem, next){
	$.ajax({
		type : 'GET',
		url : '/outlet/outletId/'+outletId,
		statusCode : {
			200 : function(res){
				addOutletDiv(findOutletObj(res.list), parentElem, 0, 1);
				return next(null, message);
			},
			400 : function(res){
				console.log(res.responseJSON.message);
			}
		}
	});
}

function putReview(outletId, reviewObj, parentElem, updateOutletInfo, next){
	$.ajax({
		type : 'PUT',
		url : '/outlet/review/'+outletId,
		data : reviewObj,
		statusCode : {
			200 : function(res){
				return updateOutletInfo(res.message, outletId, reviewObj, parentElem, next);
			},
			400 : function(res){
				return next(res.responseJSON.message, null);
			}
		}
	});
}

(function addingOwnerRestaurant() {
	$("button#restSaveBtn").click(function() {
		var parentElem = $(this).closest("#restaurantSaveInfo");
		var name = $(parentElem).find("input[name=restName]").val();
		var desc = $(parentElem).find("textarea[name=restDesc]").val();
		var address = $(parentElem).find("input[name=restAdd]").val();

		if (!name.length) {
			return showError("Enter the name of the restaurant");
		}

		var param = new Object({
			name: name,
			desc: desc,
			address: address
		});

		sanitizationUtility(param, function(err, msg, res) {
			if (err) {
				showError(msg);
			} else {
				cleanObj = res;
				$.ajax({
					type: "POST",
					url: "/outlet",
					data: cleanObj,
					fail: function() {
						showError("Unable to make request");
					},
					statusCode: {
						200 : function(data){
							showSuccess(data.message);
							$(".restSaveDiv").hide();
							addOutletDiv(findOutletObj(data.details), $(".restaurantLists"), 1, 2);
							//Clear values
							var parentElem = $("button#restSaveBtn").closest("#restaurantSaveInfo");
							$(parentElem).find("input[name=restName]").val('');
							$(parentElem).find("textarea[name=restDesc]").val('');
							$(parentElem).find("input[name=restAdd]").val('');
						},
						400: function(res) {
							showError(res.responseJSON.message);
						},
						409: function(res) {
							showError(res.responseJSON.message);
						},
						500: function(res) {
							showError(res.responseJSON.message);
						},
						401: function(res) {
							showError(res.responseJSON.message);
						},
					}
				});
			}
		})
	});
})();

function deleteOutlet(parentElem){
		var outletId = $(parentElem)[0].dataset.outletid;
		$.ajax({
			type : 'DELETE',
			url : '/outlet/'+outletId,
			statusCode: {
				200 : function(res){
					showSuccess(res.message);
					$('.reviewsDiv').hide();
					$(parentElem).fadeOut();
					$(parentElem).remove();
				},
				400 : function(res){
					showError(res.responseJSON.message);
				},
				401 : function(res){
					showError(res.responseJSON.message);
				},
				500 : function(res){
					showError(res.responseJSON.message);
				}
			}
		});
};

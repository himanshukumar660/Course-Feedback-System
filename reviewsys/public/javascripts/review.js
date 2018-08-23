$(document).on('click', '#close_error', function() {
	$(this).parent().hide();
});

function transitForms(elem) {
	$(elem).closest('.card-body').find('#err').hide();
	$(elem).closest('.card-body').find('#regSucc').hide();
}

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

function showReply() {
	$("#showReplyBtn").click(function() {
		$(this).hide();
		$(this).parent().find("p#replyText").show();
	})
};

(function toggleFilterBtn() {
	$("#fScore").click(function() {
		$(this).parent().find("ul.dropdown-menu").toggle();
	});
})();

(function filterScore() {
	//Show only those reuslts that are four stars and up
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
		preLoader();
		//if filter applied, then remove the funnel icon and add the double tick icon
		fBtn.closest($(".dropdown")).find($("#fScore .ionicons.ion-funnel")).remove();
		if (fBtn.closest($(".dropdown")).find($("#fScore .ionicons.ion-android-done-all")).length == 0) {
			fBtn.closest($(".dropdown")).find($("#fScore")).append("<i class='ionicons ion-android-done-all'></i>");
		}
		rmActiveAttr(fBtn);
		fBtn.find($(".fa.fa-chevron-circle-right")).addClass("fBtnActive");
		var counterNotShown = 0,
			counterShown = 0;
		$(".sResultsMain").find($(".sResultBox")).each(function() {
			stars = parseInt($(this).find($(".star-ratings-css-top")).css("width")) / 20;
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
					console.log(res.errors);
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

(function logIn() {
	$('#logInBtn').click(function() {
		param = new Object({
			username: DOMPurify.sanitize($('#inputLoginFeilds input[name=username]').val()),
			password: DOMPurify.sanitize($('#inputLoginFeilds input[name=password]').val())
		});
		$.ajax({
			type: 'POST',
			data: param,
			url: '/user/login',
			success: function(data) {
				$('.logInDisplay').remove();
				$('.indexPage').fadeIn();
			},
			statusCode: {
				401: function(res) {
					showLoginError(res.responseJSON.message);
				}
			}
		}).done(function() {
			getOutletList();
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

function addOutletDiv(outletObj) {

	var outletDiv =
		'<div class="sResultsMain" data-outletid='+ outletObj.uid +'>\
  	<div class="sResultBox">\
    <table>\
      <tbody>\
        <tr id="restaurantInfo">\
          <td>\
            <div id="restaurantHeading">\
              <p id="restaurantName">' + outletObj.name + '</p>\
              <button class="i ionicons ion-android-delete" id="delete" type="button"></button>\
            </div>\
            <hr/>\
            <div id="details">\
              <p id="aboutUs">' + outletObj.desc + '</p>\
              <p id="address"> <i class="ionicons ion-location" style="padding-right:10px"></i>' + outletObj.addr + '</p>\
            </div>\
          </td>\
		      <td id="restaurantBigRating">\
            <p> ' + outletObj.avgRating + ' </p>\
            <div class="rStats">\
              <div class="star-ratings-css">\
                <div class="star-ratings-css-top"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>\
                <div class="star-ratings-css-bottom"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>\
              </div>\
            </div>\
            <p style="font-size:10px;margin:0px;padding:0px;">(Avg. Rating)</p>\
          </td>\
        </tr>\
				<tr id="resultmessage">\
				<td style="float:left;width:100%">\
				<div class="alert alert-success" id="succReviewPost" style="margin-left:10px;margin-right:10px;">\
				<b>Success</b>\
				</div>\
				<div class="alert alert-danger" id="errReviewPost" style="margin-left:10px;margin-right:10px"><b>Error</b>\
				</textarea>\
				</td>\
				</tr>\
					<tr id="userCommentRating" style="display:none;float:left;width:100%;padding:10px;margin:0px">\
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
					<tr id="restaurantUtilities" style="display:none">\
						<td style="float:left;width:80%">\
						<textarea id="replyPostText" name="replyPostText" placeholder="Write reivew..." required></textarea>\
						</td>\
						<td style="float:right;padding:5px">\
						<button id="reviewPost" type="button">Post</button>\
						</td>\
					</tr>\
      </tbody>\
    </table>\
  </div>\
	</div>';

	$(outletDiv).hide().prependTo(".restaurantLists").fadeIn("slow");
	starRating();
}

$(document).on('click', '.sResultsMain', function() {
	$(this).find('#userCommentRating').show();
	$(this).find('#restaurantUtilities').show();
});

function appendOutletList(data) {
	var Outlets = data.list;
	list = new Array()

	for (var outlet in Outlets) {
		var outletObj = Outlets[outlet];
		var cleanObj = new Object({
			uid: outletObj._id,
			name: outletObj.metadata.name,
			desc: outletObj.desc,
			addr: outletObj.addr,
			reviews: outletObj.reviews
		});

		if (outletObj.reviews.length == 0) {
			cleanObj.pExReview = "No Positive Reviews";
			cleanObj.pExReviewR = "0";
			cleanObj.nExReview = "No Negetive Reviews";
			cleanObj.nExReviewR = "0";
			cleanObj.avgRating = "0";
		} else { //if the reviews section is not empty
			//Need to iterate the entire reviews
			cleanObj.pExReview = "Something Good";
			cleanObj.pExReviewR = "5";
			cleanObj.nExReview = "Something Bad";
			cleanObj.nExReviewR = "3.2";
			cleanObj.avgRating = "4.2";
		}
		list.push(cleanObj);
		console.log(list);
		addOutletDiv(cleanObj);
	}
}

function getOutletList() {
	$.ajax({
		type: 'GET',
		url: '/outlet',
		success: function(data) {
			console.log(data);
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

$(document).on('click', '#reviewPost', function(){
	var parentElem = $(this).closest('.sResultsMain');

	var outletId = $(parentElem)[0].dataset.outletid;

	var reviewComment = $(this).closest('#restaurantUtilities').find('td #replyPostText').val();
	var reviewRating = $(parentElem).find('#userCommentRating').find('ul#stars').find('li.star.selected').length;

	var reviewObj = new Object({
		rating : reviewRating,
		comment : reviewComment
	});
	console.log(reviewObj);
	putReview(outletId, reviewObj, parentElem, function(err, res){
		if(err){
			showReviewPostError(err, parentElem);
		}
		else{
			showReviewPostSuccess(res, parentElem);
		}
	});
});

function showReviewPostError(msg, elem){
	$(elem).find('#errReviewPost b').text(msg);
	$(elem).find('#errReviewPost').show();
	$(elem).find('#succReviewPost').hide();
	$(elem).find('#resultmessage').show();
	$(elem).find('#replyPostText').val('');
	console.log($(elem).find('ul#stars li.star'));
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

function putReview(outletId, reviewObj, parentElem, next){
	$.ajax({
		type : 'PUT',
		url : '/outlet/review/'+outletId,
		data : reviewObj,
		statusCode : {
			200 : function(res){
				return next(null, res.message);
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
							//Add additional attributes and add to the outlet
							param = initOutletObj(param);
							addOutletDiv(param);
							//Clear values
							var parentElem = $("button#restSaveBtn").closest("#restaurantSaveInfo");
							$(parentElem).find("input[name=restName]").val('');
							$(parentElem).find("textarea[name=restDesc]").val('');
							$(parentElem).find("input[name=restAdd]").val('');
						},
						400: function(res) {
							console.log(400 + "res");
							showError(res.responseJSON.message);
						},
						409: function(res) {
							console.log(409 + "res");
							showError(res.responseJSON.message);
						},
						500: function(res) {
							console.log(500 + "res");
							showError(res.responseJSON.message);
						},
						401: function(res) {
							console.log(401 + "res");
							showError(res.responseJSON.message);
						},
					}
				});
			}
		})
	});
})();

$(document).on('change', '.btn-file :file', function() {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
});

$(document).ready( function() {
    $('.btn-file :file').on('fileselect', function(event, numFiles, label) {

        var input = $(this).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;

        if( input.length ) {
            input.val(log);
        } else {
            if( log ) alert(log);
        }

    });

    // -------------------------------------------------
    // Ajax request to add problem
    var addProblem = $('#newProblemAjaxForm');
    $('#add').on('show.bs.modal', function() {
        $('#itemDescription').elastic();
        $('#itemName').elastic();
        var allInputs = $('#add .form-control');
        var error = $('#problemError');
        error.hide();
        $('.modal').on('hidden.bs.modal', function() {
            allInputs.val('');
        });
    });

    $('#newProblem').on('click', addProblem, function(e) {
        e.preventDefault();
        var $this = $(this);
        var allInputs = $('#add .form-control');
        var error = $('#problemError');
        $this.blur();
        if ($('#profileLi').attr('rel') == 'Connected') {
            // information gathering from the form fields
            var name =$('#itemName').val();
            var description = $('#itemDescription').val();
            var url = $('#controlerURL').attr('url');
            var valid = true;

            // Making a form data object that will be passed through ajax
            formData = new FormData();
            formData.append('file', $('input[type=file]')[0].files[0]);
            formData.append('name', name);
            formData.append('description', description);

            if (name.length < 6) {
                error.text("Įrašykite problemos pavadinimą");
                error.attr('class', 'text text-danger text-right');
                error.show();
                return valid = false;
            }

            if (description == "") {
                error.text("Aprašykite problemą");
                error.attr('class', 'text text-danger text-right');
                error.show();
                return valid = false;
            }

            if ($('input[type=file]')[0].files[0] == null) {
                error.text("Įkelkite problemos nuotrauką");
                error.attr('class', 'text text-danger text-right');
                error.show();
                return valid = false;
            }

            if (valid) {
                $.ajax({
                    url: url,
                    type: "POST",
                    data: formData,
                    contentType: false,       // The content type used when sending data to the server.
                    cache: false,             // To unable request pages to be cached
                    processData:false,        // To send DOMDocument or non processed data file it is set to false
                    success: function(data) {
                        $('#itemName').val();
                        $('#itemDescription').val();
                        $('#controlerURL').attr('url');
                        $('#newProblem').attr('class', 'btn btn-success');
                        error.text('Problema įkelta!');
                        error.attr('class', 'text text-success');
                        error.show();
                        setTimeout(function() {
                            $('.modal').modal('hide');
                        }, 500);
                        allInputs.val('');
                        location.reload();
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        alert('Užklausa nepavyko : ' + errorThrown);
                    }
                })
            }
        } else {
            requireLogin(false);
            $('#newProblem').after('<span id="problemConnect" class="text text-danger">Norėdami sukurti problemą turite prisijungti.</span>');
        }
    });
    // End of add problem
    //------------------------------------------------------------

    // -------------------------------------------------
    // Ajax request to edit problem
    function ajaxProblemEdit(url, probid, eTitle, eDescription) {
        var editedUrl = url;
        var editedProbId = probid;
        var editedTitle = eTitle.val();
        var editedDescription = eDescription.val();
        var data = {name:editedTitle, description:editedDescription, probId:editedProbId};
        $.ajax({
            type: "POST",
            url: editedUrl,
            data: data,
            success: function (data) {
                $('.modal').modal('hide');
                location.reload();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('Užklausa nepavyko : ' + errorThrown);
            }
        });
    }
    $(document).on('click', '#editProblem', function() {

        var $this = $(this).parents('.modal-content');

        var targetTitle = $this.find('#editTitle');
        var targetDescription = $this.find('#editDescription');
        var targetButtons = $this.find('.wrap-buttons-right');

        var initialTitle = targetTitle.clone();
        var initialDescription = targetDescription.clone();
        var initialButtons = targetButtons.clone();

        $(this).tooltip('hide');

        targetDescription.trigger('editItemsEvent');
        targetTitle.trigger('editItemsEvent');

        var editButton = $(this)[0].childNodes[1];
        editButton.nodeValue = 'Redaguokite pasvirą tekstą.';

        targetButtons.empty();
        targetButtons.append('<a ' +
            'data-toggle="modal" ' +
            'class="save-button">' +
                '<i ' +
                    'data-toggle="tooltip" ' +
                    'data-placement="top"  ' +
                    'title="Išsaugoti pakeitimus" ' +
                    'class="fa fa-floppy-o">' +
                '</i>' +
            '</a>');

        var url = $(this).attr('url');
        var probId = $(this).attr('probId');

        var editedTitle = $this.find('.edit-title');
        var editedDescription = $this.find('.edit-description');
        editedDescription.elastic();

        $('.modal').on('hidden.bs.modal', function() {
            $this.find('.edit-title').replaceWith(initialTitle);
            $this.find('.edit-description').replaceWith(initialDescription);
            $this.find('.wrap-buttons-right').remove();
            $this.find('.modal-footer').append(initialButtons);
            editButton.nodeValue = 'Redaguoti';
        });

        var save = $this.find('.save-button');
        save.on('click', function() {
            ajaxProblemEdit(url, probId, editedTitle, editedDescription);
        });
    });

    $('.modal').on("editItemsEvent", "#editTitle, #editDescription", function (event) {
        var target = event.currentTarget.id;
        var $this = $(this);
        var widthTitle = $this.width()+15;
        var heightDescription = $this.height();
        var title = $('<input />', {
            'type': 'text',
            'class': 'form-control edit-title',
            'style': 'width:' + widthTitle + 'px',
            'value': $(this).text()
        });
        var description = $('<textarea class="form-control edit-description">'+$(this).text()+'</textarea>');

        if (target === 'editTitle') {
            $this.replaceWith(title);
        } else if (target === 'editDescription') {
            $this.replaceWith(description);
            var val = description.val();
            description.val('');
            description.focus();
            description.val(val);
            description.height(heightDescription);
        }
    });
    // End of edit problem
    //------------------------------------------------------------

    // -------------------------------------------------
    // Ajax request to edit initiative
    function ajaxInitiativeEdit(url, initid, eDate, eDescription) {
        var editedUrl = url;
        var editedInitid = initid;

        var editedDate = eDate;
        var editedDescription = eDescription;

        var saveDate = editedDate.val();
        var saveDescription = editedDescription.val();
        var data = {description:saveDescription, date:saveDate, initid:editedInitid};

        $.ajax({
            type: "POST",
            url: editedUrl,
            data: data,
            success: function (data) {
                $('.modal').modal('hide');
                location.reload();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('Užklausa nepavyko : ' + errorThrown);
            }
        });
    }
    $('.modal').on('click', '#editInitiative', function() {
        var $this = $(this).parents('.modal-content');
        var targetDescription = $this.find('#editDescription');
        var targetDate = $this.find('#editDate');
        var targetButtons = $this.find('.wrap-buttons-right');

        var initialDescription = targetDescription.clone();
        var initialDate = targetDate.clone();
        var initialButtons = targetButtons.clone();

        $(this).tooltip('hide');

        targetDescription.trigger('editItemsEvent');
        targetDate.trigger('editItemsEvent');

        var editButton = $(this)[0].childNodes[1];
        editButton.nodeValue = 'Redaguokite pasvirą tekstą.';

        $('.modal').on('hidden.bs.modal', function() {
            $this.find('.edit-date').replaceWith(initialDate);
            $this.find('.edit-description').replaceWith(initialDescription);
            $this.find('.wrap-buttons-right').remove();
            $this.find('.modal-footer').append(initialButtons);
            editButton.nodeValue = 'Redaguoti';
        });

        targetButtons.empty();
        targetButtons.append('<a id="floppy" ' +
            'data-toggle="modal" ' +
            'class="save-button">' +
                '<i ' +
                'data-toggle="tooltip" ' +
                'data-placement="top"  ' +
                'title="Išsaugoti pakeitimus" ' +
                'class="fa fa-floppy-o">' +
                '</i>' +
            '</a>');

        var url = $(this).attr('url');
        var initid = $(this).attr('initid');
        var editedDate = $this.find('.edit-date');
        var editedDescription = $this.find('.edit-description');
        editedDescription.elastic();

        var save = $this.find('.save-button');

        save.on('click', function(){
            ajaxInitiativeEdit(url, initid, editedDate, editedDescription);
        });
    });

    $('.modal').on("editItemsEvent", "#editDescription, #editDate", function (event) {
        var target = event.currentTarget.id;
        var $this = $(this);
        var heightDescription = $this.height();
        var description = $('<textarea class="form-control edit-description">'+$(this).text()+'</textarea>');
        var date = $('<input />', {
            'type': 'text',
            'class': 'form-control edit-date',
            'value': $(this).text()
        });
        if (target === 'editDescription') {
            $this.replaceWith(description);
            var val = description.val();
            description.val('');
            description.focus();
            description.val(val);
            description.height(heightDescription);
        } else if (target === 'editDate') {
            $this.replaceWith(date);
        }
    });
    // End of edit initiative
    //------------------------------------------------------------


    // -------------------------------------------------
    // Ajax request to load profile modal with history
    $(".profileHistory").on('click', function(event){
        event.preventDefault();
        var url = $('.profileHistory').attr('href');
        var container = $(".history-content");
        if (container.data('loaded')) {
            $('#historyButtonMore').prop('value', 'Peržiūrėti istoriją');
        } else {
            container.hide();
            $.ajax({
                type: "POST",
                url: url,
                cache: "false",
                dataType: "html",
                success: function(result) {
                    if (result == undefined) {
                        $(".filters-history").find("li").removeClass("active").addClass("disabled");
                        closeAndScroll('html, body', '#list');
                        var here = '<a data-dismiss="modal">čia!</a>';
                        var initiative = '<i data-toggle="tooltip" data-placement="top" title="Skelbti iniciatyvą" class="fa fa-bullhorn"></i>';
                        container.append(
                            '<p>Paskelbkite problemą ' + here + '<br>' +
                            'Paskelbkite iniciatyvą problemos lange spusteldami ' + initiative + '<br>' +
                            'Arba prisijunkite prie jau sukurtos iniciatyvos spusteldami čia!</p>'
                        ).slideDown('slow');
                    } else {
                        container.append(result).slideDown('slow');
                        filters();
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    alert('Užklausa nepavyko : ' + errorThrown);
                },
                complete: function() {
                    setUserStats();
                }
            }).done(function () {
                container.data('loaded', true);
                handleDelete();
            });
        }
    });

    function recursiveAdd(number, desired ,timeout, selector){
        $(selector).text(number);
        if(number<desired){
            number = number + Math.round((desired-number)/2);
            setTimeout(function(){recursiveAdd(number,desired,timeout,selector);},timeout);
        }
    }

    function setUserStats(){
        var url = $('#userStats').attr('url');
        $.ajax({
            url:url,
            success: function(data){
                var timeout = 80;
                $(".problemsCreated").text(0);
                $(".problemsUpvoted").text(0);
                var created = data.created;
                var upvoted = data.upvoted;
                setTimeout(function(){recursiveAdd(0,created,timeout,".problemsCreated");},300);
                setTimeout(function(){recursiveAdd(0,upvoted,timeout,".problemsUpvoted");},300);
            }
        })
    }
    // End of ajax load history
    //------------------------------------------------------------

    // -------------------------------------------------
    // Problemos / iniciatyvos istrynimas
    function handleDelete() {
        $(".fa-trash").on("click", function(e){
            var type = $(this).attr('type');
            var url = $(this).attr('url');
            var itemId = $(this).attr('itemId');
            var data = {type: type, itemId: itemId};
            $.ajax({
                url: url,
                type: "POST",
                data: data,
                success: function (data) {
                    if(data.type == 'problem'){
                        $('#problemHistory-'+data.itemId).hide('slow');
                    } else if(data.type == 'initiative'){
                        $('#initiativeHistory-'+data.itemId).hide('fast');
                    }
                    $('#'+type+'Display-'+itemId).hide('fast');
                    setTimeout(function(){
                        $('.isotope-container').isotope({
                        itemSelector: '.isotope-item',
                        layoutMode: 'masonry',
                        transitionDuration: '0.6s',
                        filter: "*"
                    });
                    },201);
                    setTimeout(function(){
                        $('.table-like').isotope({
                            itemSelector: '.table-like__item',
                            layoutMode: 'vertical',
                            transitionDuration: '0.6s',
                            filter: "*"
                        });
                    },601);

                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert('Atsiprašome, įvyko klaida');
                }
            });
        });
    }

    // -------------------------------------------------
    // Add initiative

    // A function to clear the initiative form
    function clearInitiativeFormContent(){
        $('#newDescription').val('');
        $('#newDate select:nth-child(1)').val('');
        $('#newDate select:nth-child(2)').val('');
        $('#newDate select:nth-child(3)').val('');
        $('#newDate div:nth-child(2) select:nth-child(1)').val('');
        $('#newDate div:nth-child(2) select:nth-child(2)').val('');
    }

    function clearInitiativeForm(){
        $("#initiativeDescriptionDiv").attr('class','form-group has-feedback');
        $("#initiativeDateDiv").attr('class','form-group has-feedback');
        $("#submitButton").attr('class', 'btn btn-default');
        $("#initiativeError").text('');
        $("#initiativeError").hide();
    }

    // handle initiative form modal

    $('.openInitiativeModal').on('click', function(e){
        $('.modal').modal('hide');
        // open initiative form for that problem via ID
        clearInitiativeFormContent();
        $('#ajimedakaqfn').attr('probId', $(this).attr('probId'));
    });

    $("#addInitiative").on('hidden.bs.modal', function(e){
        clearInitiativeForm();
        clearInitiativeFormContent();
    });

    // handle initiative form data

    var addInitiative = $('#Miestietis_MainBundle_Initiative');
    $('#newDescription').elastic();
    $('#submitButton').on('click', addInitiative, function(e){
        clearInitiativeForm();
        e.preventDefault();
        if ($('#profileLi').attr('rel') == 'Connected') {
            var description = $('#newDescription').val();
            var year = $('#newDate select:nth-child(1)').val();
            var month = $('#newDate select:nth-child(2)').val();
            var day = $('#newDate select:nth-child(3)').val();
            var hour = $('#newDate div:nth-child(2) select:nth-child(1)').val();
            var minute = $('#newDate div:nth-child(2) select:nth-child(2)').val();
            var valid = true;

            if (description.length<6) {
                $("#initiativeDescriptionDiv").attr('class','form-group has-error text-right');
                $("#initiativeError").text("Nepakankamas aprašymas");
                $("#initiativeError").attr('class','text text-danger text-right');
                $("#initiativeError").show();
                 return valid = false;
            }

            if (year=="") {
                $("#initiativeError").text("Pasirinkite metus");
                $("#initiativeError").attr('class','text text-danger');
                $("#initiativeError").show();
                 return valid = false;
            }

            if (month=="") {
                $("#initiativeError").text("Pasirinkite mėnesį");
                $("#initiativeError").attr('class','text text-danger');
                $("#initiativeError").show();
                 return valid = false;
            }

            if (day=="") {
                $("#initiativeError").text("Pasirinkite dieną");
                $("#initiativeError").attr('class','text text-danger');
                $("#initiativeError").show();
                return valid = false;
            }

            if (hour=="") {
                $("#initiativeError").text("Pasirinkite valnandą");
                $("#initiativeError").attr('class','text text-danger');
                $("#initiativeError").show();
                return valid = false;
            }

            if (minute=="") {
                $("#initiativeError").text("Pasirinkite minutę");
                $("#initiativeError").attr('class','text text-danger');
                $("#initiativeError").show();
                return valid = false;
            }

            if (valid) {
                var date = year.concat("-", month, "-", day, " ", hour, ":", minute,":",0); //for 0seconds
                var url = $('#ajimedakaqfn').attr('url');
                var probId = $('#ajimedakaqfn').attr('probId');
                var data = {description: description, date: date, probId:probId};
                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    success: function (data) {
                        if(data.status != null){
                            $("#initiativeError").text(data.status);
                            $("#initiativeError").attr('class','text text-danger');
                            $("#initiativeError").show();
                        }else{
                            $('#submitButton').attr('class', 'btn btn-success');
                            $("#initiativeError").html("Iniciatyva pateikta!");
                            $("#initiativeError").attr('class','text text-success');
                            $("#initiativeError").show();
                            setTimeout(function(){
                                $('.modal').hide('fast');
                            },500);
                        }
                        location.reload();
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        alert('Užklausa nepavyko : ' + errorThrown);
                    }
                });
            }
        } else {
            requireLogin(false);
            $("#initiativeError").html("Norėdami sukurti iniciatyvą turite prisijungti");
            $("#initiativeError").attr('class','text text-success');
            $("#initiativeError").show();
        }
    });
    // End of add initiative
    //------------------------------------------------------------


    // -------------------------------------------------
    // Handle upvoting
    $('.incVote').on('click',function() {
        var item = $(this).children('i');
        var $this = $(this);
        var itemParent = $this.parents('.isotope-item');
        var itemDisable = itemParent.find('.incVote');
        var status = 'Pritarti galite tik vieną kartą!';
        if ($('#profileLi').attr('rel') == 'Connected') {
            var url = $(this).attr('url');
            var probId = $(this).attr('probId');
            var data = {probId: probId};
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                success: function (data) {
                    var probId = data.probId;
                    var votes = data.votes;
                    $('.votes-'.concat(probId)).text(votes);
                },
                complete: function() {
                    itemDisable.addClass('disabled');
                    item.attr('data-original-title', status)
                        .tooltip('fixTitle')
                        .tooltip('show');
                }
            });
        } else {
            requireLogin(true);
        }
    });
    // End of upvote
    //------------------------------------------------------------


    //------------------------------------------------------------------------------------------------
    // Adding and loading comments
    $('.modal-comments').hide();
    $('.fa-comments').on('click', function(e){
        e.preventDefault();
        var clicks = $(this).data('clicks');
        var url = $(this).attr('url');
        var item =$(this).attr('item');
        var item_id =$(this).attr('item_id');
        var $comment_list = $('#comment_list_'+item_id);
        var comments = $(this).parents('.modal-content').find('.modal-comments');
        var rm = $(this).parents('.modal-content');
        var hr;
        var data = {id: item_id, item: item, url: url};

        $comment_list.find('textarea').attr('url', url+'Add');
        $comment_list.find('textarea').attr('item', item);
        $comment_list.find('textarea').attr('item_id', item_id);
        $('.comment_input').elastic();
        if (!clicks) {
            $.ajax({
                url: url,
                type: "POST",
                data: data,
                success: function (data) {
                    data.forEach(function(i){
                        $comment_list.prepend('<div class="modal-comments--comment">'+
                            '<img src="' + i['user_picture'] + '" class="profile-picture" alt="">'+
                            '<div class="comment-info">'+
                            '<div class="comment-details">'+
                            '<div class="comment-author">'+i['user_name']+'</div>'+
                            '<div class="comment-date"><i class="fa fa-calendar-plus-o"></i>'+i['date']+'</div>'+
                            '</div>'+
                            '<p>'+i['comment']+'</p>'+
                            '</div>'+
                            '</div>'+'<hr>');
                    });

                },
                complete: function() {
                    comments.slideDown('slow');
                    $('.modal').on('hide.bs.modal', function() {
                        rm = rm.find('.modal-comments--comment, .modal-comments--comment+hr');
                        rm.remove();
                        comments.hide();
                    });
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert('Užlausa nepavyko : ' + errorThrown);
                }
            });
        } else {
            comments.slideUp('slow', function() {
                rm = rm.find('.modal-comments--comment, .modal-comments--comment+hr');
                rm.remove();
            });
        }

        $(this).data('clicks', !clicks);

        $('.comment_input').on('keydown', function(e) {
            var parent = $(this).parents('.modal-content');
            var commentSpan = parent.find('.comment-count');
            var commentCount = commentSpan.text();

            if (e.which == 13 && !e.shiftKey) {
                var comment = $(this).val();
                if (comment != '' && comment != null && comment.trim() != 0) {
                    var url = $(this).attr('url');
                    var item = $(this).attr('item');
                    var item_id = $(this).attr('item_id');
                    var data = {comment: comment, item: item, item_id: item_id};
                    var $comment_list = $('#comment_list_' + item_id);
                        e.preventDefault();
                        $.ajax({
                            url: url,
                            type: "POST",
                            data: data,
                            success: function (data) {
                                $comment_list.prepend('<div class="modal-comments--comment">'+
                                    '<img src="' + data['picture'] + '" class="profile-picture" alt="">'+
                                    '<div class="comment-info">'+
                                    '<div class="comment-details">'+
                                    '<div class="comment-author">'+data['user_name']+'</div>'+
                                    '<div class="comment-date"><i class="fa fa-calendar-plus-o"></i>'+data['date']+'</div>'+
                                    '</div>'+
                                    '<p>'+data["text"]+'</p>'+
                                    '</div>'+
                                    '</div>'+'<hr>');
                                commentSpan.text(parseInt(commentCount) + 1);
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                                alert('Užklausa nepavyko : ' + errorThrown);
                            }
                        });
                    $(this).attr('placeholder', 'Jūsų komentaras');
                    $(this).removeClass('comment-input__danger');
                } else {
                    e.preventDefault();
                    $(this).attr('placeholder', 'Įrašykite komentarą');
                    $(this).addClass('comment-input__danger');
                }
                $(this).val('');
            }
        });
    });
    // End of comment handling
    //------------------------------------------------------------


    //------------------------------------------------------
    // Top10 problem filtering
    $topProblems = $('.topProblems');
    $('#top10problems').on('click', function(){
        $topProblems.toggleClass('hidden');
    });
    $('.problemFilterButton').on('click', function(){
        if(!$topProblems.hasClass('hidden')){
            $topProblems.addClass('hidden');
        }

    });
    // End of top10 filtering
    //------------------------------------------------------

    //------------------------------------------------------
    // Join initiative
    $('.joinInitiative').on('click', function() {
        var initiative = $(this).attr('item_id');
        var itemDisable = $(this);
        var url = $(this).attr('url');
        var date = $(this).attr('date');
        var data = {initiative : initiative};
        var confirmModal = $('#confirm-join');
        var successJoin = $('#success-join');

        confirmModal.modal('show');

        confirmModal.on('click', '#confirmJoin', '#cancelJoin', function(event) {
            var target = event.currentTarget.id;
            if (target == 'confirmJoin') {
                $.ajax({
                    url: url,
                    type: "POST",
                    data: data,
                    success: function (data) {
                        successJoin.find('.success-text').text('Sėkmingai prisijungėte prie iniciatyvos.');
                        successJoin.find('.success-time').text('Organizatoriai Jūsų lauks '+date);
                    },
                    complete: function() {
                        itemDisable.addClass('disabled');
                        successJoin.modal('show');
                    }
                });
            } else if (target == 'cancelJoin') {
                confirmModal.modal('hide');
            }
        });
    });
    // End of join
    //------------------------------------------------------

    //------------------------------------------------------
    // Add more items to the item list
    $('#addMoreItems').on('click', function(){
        var url = $(this).attr('url');
        $.ajax({
            url: url,
            type: "POST",
            success: function (data) {
                console.log(data);
                data['problems'].forEach(function(problem){
                    $('#theContainerOfItems').append(problem);
                });
                data['initiatives'].forEach(function(initiatve){
                    $('#theContainerOfItems').append(initiatve);
                });
                if (data['more'] == false) {
                    $('#addMoreItems').addClass('hidden');
                }
                $('.isotope-container').isotope('reloadItems');
                $('.isotope-container').isotope('reLayout');
                $('a[data-filter="*"]').click();
            }
        });
        return false;
    });


    //------------------------------------------------------
    // Santa's little helpers
    function filters() {
        if ($('.table-like').length>0) {
            $('.table-like').fadeIn('slow');
            $('#profile-more').on('shown.bs.modal', function() {
                var $cont = $('.table-like').isotope({
                    itemSelector: '.table-like__item',
                    layoutMode: 'vertical',
                    transitionDuration: '0.6s',
                    filter: "*"
                });
                $('.filters-history').on( 'click', 'ul.nav-hist li a', function() {
                    var filterValue = $(this).attr('data-filter');
                    console.log(filterValue);
                    $(".filters-history").find("li.active").removeClass("active");
                    $(this).parent().addClass("active");
                    $cont.isotope({ filter: filterValue });
                    return false;
                });
            });
        }
        $('#profile-more').on('hidden.bs.modal', function() {
            $(".filters-history").find("li").removeClass("active");
            $(".filters-history").find('.onHide').addClass("active");
        });
    }

    function requireLogin(hideModal) {
        if(hideModal) {
            $('.modal').modal('hide');
        }
        $('#profileLi > a').css('animation', 'bounceIn 1s')
            .css('animation-iteration-count', 'infinite');


        $(document).on('scroll shown.bs.modal', function() {
                $('#profileLi > a').css('animation-iteration-count', '1');
            }
        );
        $('.isotope-item').mouseleave(function() {
            $('#profileLi > a').css('animation-iteration-count', '1');
        });
    }

    function closeAndScroll(modal, target) {
        $(modal).on('hidden.bs.modal', function() {
            $('html, body').animate({
                scrollTop: $(target).offset().top-151
            }, 1000);
        })
    }
    // End of helpers
    //------------------------------------------------------
});
// i have no idea what these do | Marius
$(document).on('change', '.btn-file :file', function() {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
});

$(document).ready( function() {

    // i have no idea what these do | Marius
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
    $('#newProblem').on('click', addProblem, function(e){
        e.preventDefault();
        if($('#profileLi').attr('rel') == 'Connected'){
            // information gathering from the form fields
            var name =$('#itemName').val();
            var description = $('#itemDescription').val();
            var url = $('#controlerURL').attr('url');
            var allInputs = $('#add .form-control');
            // final check if everything is
            $('#loading-img').show();

            // Making a form data object that will be passed through ajax
            formData = new FormData();
            formData.append('file', $('input[type=file]')[0].files[0]);
            formData.append('name', name);
            formData.append('description', description);

            $.ajax({
                url: url,
                type: "POST",
                data: formData,
                contentType: false,       // The content type used when sending data to the server.
                cache: false,             // To unable request pages to be cached
                processData:false,        // To send DOMDocument or non processed data file it is set to false
                success: function(data)
                {
                    if(data == false){
                        alert('somethings wrong');
                    }
                    $('#loading-img').hide();
                    console.log(data);
                    $("#imgdisplay").html("<img src='../images/problems"+data.picture+"'style='width: 150px'>");
                },
                error: function(XMLHttpRequest, textStatus, errorThrown)
                {
                    alert('Error : ' + errorThrown);
                },
                 /*complete: function() {
                    createProblem();
                    $('.modal').modal('hide');
                    allInputs.val('');
                    location.reload(); // VERY VERY BAD PRACTICE reloads whole page, need some sort of handler maybe in backend, if mysql db is updated update the view
                }*/
            });
        }else{
            requireLogin(false);
            $('#newProblem').after('<span>Norėdami sukurti problemą turite prisijungti.</span>');
        }
    });
    // End of add problem
    //------------------------------------------------------------

    // -------------------------------------------------
    // Ajax request to edit item
    function ajaxProblemEdit(){
        var url = $('#editItem').attr('url');
        var probId = $('#editItem').attr('probId');

        var title = $('.edit-title').val();
        var description = $('.edit-description').val();
        var address = $('.edit-address').val();
        var data = {title:title, description:description, address:address, probId:probId};
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            success: function (data) {
                alert('gg');
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('Error : ' + errorThrown);
            }
        });
    };
    $(document).on('click', '#editItem', function() {
        // galima tiesiog padaryti input'us ir disable'inti pagal reikala, input'ai gali buti stilizuojami kaip nori
        // jeigu bus laiko padarysiu sitaip
        // sitas approach'as blogas sukuria papildomu nematomu elementu DOM'e
        // bandytas approach'as su input fieldais iskarto - neina su jquery priskirti auksciu Pries uzkraunant modal'o css, o jeigu po - split second matosi vaizdo iskraipymas
        var $this = $(this).parents('.modal-content');

        var targetTitle = $this.find('#editTitle');
        var targetDescription = $this.find('#editDescription');
        var targetAddress = $this.find('#editAddress');
        var targetButtons = $this.find('.wrap-buttons-right');

        var initialTitle = targetTitle.clone();
        var initialDescription = targetDescription.clone();
        var initialAddress = targetAddress.clone();
        var initialButtons = targetButtons.clone();

        $(this).tooltip('hide');

        targetAddress.trigger('editItemsEvent');
        targetDescription.trigger('editItemsEvent');
        targetTitle.trigger('editItemsEvent');

        var editButton = $(this)[0].childNodes[1];
        editButton.nodeValue = 'Redaguokite pasvirą tekstą.';

        $('.modal').on('hidden.bs.modal', function() {
            $this.find('.edit-title').replaceWith(initialTitle);
            $this.find('.edit-description').replaceWith(initialDescription);
            $this.find('.edit-address').replaceWith(initialAddress);
            $this.find('.wrap-buttons-right').remove();
            $this.find('.modal-footer').append(initialButtons);
            editButton.nodeValue = 'Redaguoti';
        });

        targetButtons.empty();
        targetButtons.append('<a ' + //man atrodo galima naudot backtick'us multiline stringui (`)
            'data-toggle="modal" ' +
            'class="save-button">' +
            //'probId="{{ problem.id() }}" ' +
            //'url="{{ path(ajax_problemEdit) }}">' + //twig'as veikia tik back-end'e
                '<i ' +
                    'data-toggle="tooltip" ' +
                    'data-placement="top"  ' +
                    'title="Išsaugoti pakeitimus" ' +
                    'class="fa fa-floppy-o">' +
                '</i>' +
            '</a>');
        $('.save-button').on('click',function(){
            ajaxProblemEdit();
        });

    });

    $('.modal').on("editItemsEvent", "#editTitle, #editDescription, #editAddress", function (event) {
        var target = event.currentTarget.id;
        var $this = $(this);
        var widthTitle = $this.width()+15;
        var heightDescription = $this.height();
        var widthAddress = $this.width()+25;
        var title = $('<input />', {
            'type': 'text',
            'class': 'form-control edit-title',
            'style': 'width:' + widthTitle + 'px',
            'value': $(this).text()
        });
        var description = $('<textarea class="form-control edit-description">'+$(this).text()+'</textarea>');
        var address = $('<input />', {
            'type': 'text',
            'class': 'form-control edit-address',
            'style': 'width:' + widthAddress + 'px',
            'value': $(this).text()
        });

        if (target === 'editTitle') {
            $this.replaceWith(title);
            //title.focus();
        } else if (target === 'editDescription') {
            $this.replaceWith(description);
            var val = description.val();
            description.val('');
            description.focus();
            description.val(val);
            description.height(heightDescription);
        } else if (target === 'editAddress') {
            $this.replaceWith(address);
        }
    });


    // End of edit item
    //------------------------------------------------------------


    // -------------------------------------------------
    // Ajax request to load profile modal with history

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
                var timeout = 80 //80ms to increment the stats
                $(".problemsCreated").text(0);
                $(".problemsUpvoted").text(0);
                var created = data.created;
                var upvoted = data.upvoted;
                setTimeout(function(){recursiveAdd(0,created,timeout,".problemsCreated");},400); //initial delay while the modal opens
                setTimeout(function(){recursiveAdd(0,upvoted,timeout,".problemsUpvoted");},400);
            }
        })
    }

    $(".profileHistory").on('click', function(event){
        event.preventDefault();
        setUserStats();
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
                success: function(result)
                {
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
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown)
                {
                    alert('Error : ' + errorThrown);
                },
                complete: function()
                {
                    filters();
                }
            }).done(function () {
                container.data('loaded', true);
            });
        }
    });
    // End of ajax load history
    //------------------------------------------------------------

    // -------------------------------------------------
    // Add initiative

    //A function to clear the initiatvie form
    function clearInitiativeFormContent(){
        $('#newDescription').val('');
        $('#newDate select:nth-child(1)').val('');
        $('#newDate select:nth-child(2)').val('');
        $('#newDate select:nth-child(3)').val('');
        $('#newDate div:nth-child(2) select:nth-child(1)').val('');
        $('#newDate div:nth-child(2) select:nth-child(2)').val('');
    }

    function clearInitiativeForm(){
        //clearInitiativeFormContent();
        $("#initiativeDescriptionDiv").attr('class','form-group has-feedback');
        $("#initiativeDateDiv").attr('class','form-group has-feedback');
        $("#submitButton").attr('class', 'btn btn-default');
        $("#initiativeError").text('');
        $("#initiativeError").hide();
    }

    //handle initiative form modal

    $('.openInitiativeModal').on('click', function(e){
        //hide opened problem modal
        $('.modal').modal('hide');
        //open initiative form for that problem via ID
        clearInitiativeFormContent();
        $('#ajimedakaqfn').attr('probId', $(this).attr('probId'));
    });

    $("#addInitiative").on('hidden.bs.modal', function(e){
        clearInitiativeForm();
        clearInitiativeFormContent();
    });
    //---------------------------------------------------
    //handle initiative form data
    var addInitiative = $('#Miestietis_MainBundle_Initiative');
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
            //validation:
            if(description.length<6){
                $("#initiativeDescriptionDiv").attr('class','form-group has-error text-right');
                $("#initiativeError").text("Nepakankamas aprašymas");
                $("#initiativeError").attr('class','text text-danger text-right');
                $("#initiativeError").show();
                 return valid = false;
            }
            if(year==""){
                $("#initiativeError").text("Pasirinkite metus");
                $("#initiativeError").attr('class','text text-danger');
                $("#initiativeError").show();
                 return valid = false;
            }

            if(month==""){
                $("#initiativeError").text("Pasirinkite mėnesį");
                $("#initiativeError").attr('class','text text-danger');
                $("#initiativeError").show();
                 return valid = false;
            }

            if(day==""){
                $("#initiativeError").text("Pasirinkite dieną");
                $("#initiativeError").attr('class','text text-danger');
                $("#initiativeError").show();
                return valid = false;
            }

            if(hour==""){
                $("#initiativeError").text("Pasirinkite valnandą");
                $("#initiativeError").attr('class','text text-danger');
                $("#initiativeError").show();
                return valid = false;
            }

            if(minute==""){
                $("#initiativeError").text("Pasirinkite minutę");
                $("#initiativeError").attr('class','text text-danger');
                $("#initiativeError").show();
                return valid = false;
            }

            if (valid) {//description != '' & year != '' & month != '' & day != '' & hour != '' & minute != ''
                var date = year.concat(" ", month, " ", day, " ", hour, " ", minute);
                var url = $('#ajimedakaqfn').attr('url');
                //var url='NANI?';
                var probId = $('#ajimedakaqfn').attr('probId');
                var data = {description: description, date: date, probId:probId};
                console.log(data);
                console.log(url);
                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    success: function (data) {
                        if(data.status != null){
                            alert(data.status);
                        }else{
                            $('#submitButton').attr('class', 'btn btn-success');
                            $("#initiativeError").html("Iniciatyva pateikta!");
                            $("#initiativeError").attr('class','text text-success');
                            $("#initiativeError").show();
                            //$(".modal").modal("hide");
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        alert('Error : ' + errorThrown);
                    }
                });
            }
        } else {
            requireLogin(false);
            $('#submitButton').after('<span>Norėdami sukurti iniciatyvą turite prisijungti.</span>');
        }
    });
    // End of add initiative
    //------------------------------------------------------------


    // -------------------------------------------------
    // Handle upvoting

    $('.incVote').on('click',function(){ //increment vote
        var item = $(this).children('i');
        var itemDisable = $(this);
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
                    $(".filters-history").find("li.active").removeClass("active");
                    $(this).parent().addClass("active");
                    $cont.isotope({ filter: filterValue });
                    return false;
                });
            });
        }
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
                    alert('Error : ' + errorThrown);
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

                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                                alert('Error : ' + errorThrown);
                            }
                        });
                    $(this).attr('placeholder', 'Jūsų komentaras');
                    $(this).removeClass('comment-input__danger');

                } else {
                    e.preventDefault();
                    $(this).attr('placeholder', 'Įrašykite komentarą');
                    $(this).addClass('comment-input__danger');
                }
            }
            $(this).val('');
        });
    });
});
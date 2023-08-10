var Seeko = Seeko || {};
(function ($) {
    // USE STRICT
    "use strict";

    Seeko.main = {
        visibleLabelFilter: 0,
        formClass: '.filter-search-container',
        inputs: 'input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=reset])',
        currentRequest: null,
        bpComponent: null,
        onLoad: function () {
        },

        init: function () {
            $body = $('body');
            var $filterSearch = $('.filter-search');
            var auxOpenSearch = false;

            if ($('.filter-search-module').length > 0) {
                if ($('#members_search').length > 0) {
                    Seeko.main.bpComponent = 'members';
                } else if ($('#groups_search').length > 0) {
                    Seeko.main.bpComponent = 'groups';
                }
            }

            //Inline form, remove empty inputs from link
            $('.filter-search-collapsed > form').submit(function () {
                $(this).find('input[type!="radio"][value=""],select:not(:has(option:selected[value!=""]))').attr('name', '');
                Seeko.main.setFormCookie(Seeko.main.getFormValues($(this).parent().parent(), false), $('.sks-form-id', this).val(), this);
            });

            //open modal from class
            $(document).on("click", ".open-seeko-search", function () {
                var $modal = $('.filter-search').first();
                if ($modal.hasClass('filter-search-side')) {
                    var trigger = $('.filter-search-module').find('input[type="text"]');
                    Seeko.main.filterSearchSideOpen(trigger);
                } else {
                    auxOpenSearch = true;
                    $modal.modal('show');

                }

                return false;
            });

            //toggle active tabs
            $(document).on('click', '.btn-filters.active', function () {
                if ($(this).hasClass("active")) {

                    $($(this).attr('href')).removeClass("active show");
                    $(this).removeClass("active show");

                    var context = $(this).closest('.filter-search-container');
                    Seeko.main.ajaxFilter(context);

                } else {
                    $(this).tab('show');
                }
            });

            // remove individual filters
            $(document).on('click', '.accordion-remove-trigger', function (e) {
                e.preventDefault();

                Seeko.main.removeOneFilter($(this));
                return false;

            });

            // remove all filters
            $(document).on('click', '.filter-search .tab-pane.selected-filters .tab-title', function (e) {
                Seeko.main.removeAllFilters($(this));
                e.preventDefault();
                return false;

            });

            //applied filters
            $(document).on('click', '.filter-search .tab-pane.selected-filters .tab-trigger', function (e) {
                var filterSearch = $(this).closest(".filter-search");

                if (!filterSearch.hasClass("show-filters-xs") && !filterSearch.hasClass("filter-search-side") && ($body.hasClass("device-xs") || $body.hasClass("device-sm"))) {
                    filterSearch.find(".close-filters").removeAttr("data-dismiss").attr("data-back", "true");
                    if (filterSearch.hasClass('is-dark')) {
                        filterSearch.addClass("show-filters-xs").removeClass("enable-dark");
                    }
                }

                e.preventDefault();
                return false;
            });

            /* After modal is open */
            $filterSearch.on('shown.bs.modal', function (e) {
                var _el = this;

                $(_el).find(".filter-search-input").focus();
                var container = $(_el).find('.suggestions-col').find('.scroll-content');
                if (container.children().length > 1) {
                    setTimeout(function () {
                        container.seeko_general_onebyone();
                    }, (650));
                }

            });
            /* After modal is closed */
            $filterSearch.on('hidden.bs.modal', function (e) {
                $(this).find('.suggestions-col .scroll-content .seeko-el-appear').removeClass('seeko-start-anim');
            });


            /* When modal is open */
            $filterSearch.on('show.bs.modal', function (e) {

                //do ajax request
                if ($(this).find('.scroll-content').is(':empty')) {
                    Seeko.main.ajaxFilter(this);
                }

                //create trace
                var myTrigger = $(e.relatedTarget);

                if (auxOpenSearch == true) {
                    myTrigger = $(".open-seeko-search");
                }

                if (myTrigger.hasClass("tracing-trigger")) {

                    var backgroundColor = myTrigger.css('backgroundColor');
                    var displayTrigger = myTrigger.css('display');

                    var widthTrigger = myTrigger.css('width');
                    var widthParentTrigger = myTrigger.parent().css('width');
                    var wW = "auto";

                    if (widthTrigger === widthParentTrigger) {
                        wW = "100%";
                    }

                    $('head').append('<style class="sk-trigger-trace-style" type="text/css">.trigger-wrapper.is-trigger .trigger-trace { background-color:' + backgroundColor + '; }  * { mix-blend-mode: unset !important; } .filter-search-module { z-index: 1031; } </style>');

                    if (myTrigger.parent(".trigger-wrapper").length) {
                        myTrigger.parent(".trigger-wrapper").addClass("is-trigger");

                        setTimeout(function () {
                            myTrigger.parent(".trigger-wrapper").addClass("active");
                        }, 100);

                    } else {

                        myTrigger.prev(".icon").addBack().wrapAll("<span class='trigger-wrapper is-trigger'></span>");
                        myTrigger.after("<span class='trigger-trace'></span>");

                        myTrigger.parent(".trigger-wrapper").css({
                            "display": displayTrigger,
                            "width": wW
                        });

                        setTimeout(function () {
                            $(".trigger-wrapper.is-trigger").addClass("active");
                        }, 1);
                    }
                }

            });

            //remove trace
            $filterSearch.on('hide.bs.modal', function (e) {
                $('.sk-trigger-trace-style').remove();
                $(".trigger-wrapper").removeClass("active is-trigger");
                auxOpenSearch = false;
            });

            //tabs
            $('.filter-search a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                var filterSearch = $(this).closest(".filter-search");
                var context = $(this).closest('.filter-search-container');

                Seeko.main.toggleSuggestionsFilters(filterSearch, 'filters');
                Seeko.main.ajaxFilter(context);
                Seeko.main.setViewLink(this);
            });


            $('.filter-search a[data-toggle="tab"]').on('click', function (e) {

                if ($(this).hasClass('active')) {
                    var filterSearch = $(this).closest(".filter-search");

                    if (!filterSearch.hasClass('show-filters-xs')) {
                        Seeko.main.toggleSuggestionsFilters(filterSearch, 'filters');
                        return false;
                    } else {
                        Seeko.main.toggleSuggestionsFilters(filterSearch, 'suggestions');
                    }
                }
            });

            /* Open tabs from outside modal */
            $(".outer-tab-trigger").click(function () {
                var target = $(this).attr("data-target");
                $(".filter-search").find("a[href='" + target + "']").tab('show');
            });

            //back button
            $(document).on('click', 'a[data-back="true"]', function (e) {
                var filterSearch = $(this).closest(".filter-search");

                if ($body.hasClass("device-xs") || $body.hasClass("device-sm")) {
                    $(this).removeAttr("data-back").attr("data-dismiss", "modal");
                    if (filterSearch.hasClass('is-dark')) {
                        filterSearch.removeClass("show-filters-xs").addClass("enable-dark");
                    }

                }

                if (filterSearch.find(".tab-pane.active.show").hasClass("selected-filters")) {
                    filterSearch.addClass("selected-filters-xs");
                } else {
                    if (filterSearch.hasClass("selected-filters-xs")) {
                        filterSearch.removeClass("selected-filters-xs");
                    }
                }

                e.preventDefault();
                return false;
            });

            // Members filter search side open
            $(document).on('click', '.filter-search-module .sko-bp-side-trigger, .filters-members-dir a.close-filters, .filters-groups-dir a.close-filters, .sks-close-modal', function () {
                Seeko.main.filterSearchSideOpen($(this));
                return false;
            });

            /* Sync inputs on members/groups dir */
            if (Seeko.main.bpComponent !== null) {
                var bpSearchInput = $('#' + Seeko.main.bpComponent + '_search');
                bpSearchInput.val($('.filter-search').first().find('.filter-search-input').val());
            }

            // remove individual filters from labels
            $(document).on('click', '.label-applied-filters .remove-existing-filters', function (e) {

                e.preventDefault();

                var accId = $(this).attr("data-target");

                if (accId === 'main-input') {
                    if (Seeko.main.removeBpSearchParam() === true) {
                        $(this.closest('li').remove());
                    }
                } else {
                    var activeAccId = $("#" + accId).children(".accordion-remove-trigger");
                    Seeko.main.removeOneFilter(activeAccId);
                }

                return false;
            });

            // remove all from labels
            $(document).on('click', '.label-remove-filters .filter-tag', function (e) {
                //filter search

                // Remove input search value
                Seeko.main.removeBpSearchParam();

                Seeko.main.removeAllFilters($(".filter-search-side .tab-pane.selected-filters .tab-title"));
                //labels
                $(".label-applied-filters li").removeClass("is-valid");
                $(".label-remove-filters").removeClass("is-valid");
                e.preventDefault();

                return false;
            });

            /* On change */
            $('select, ' + Seeko.main.inputs, Seeko.main.formClass).on("change", function (e) {
                e.preventDefault();

                var accordionCard = $(this).closest(".accordion-card");
                var accordionHeader = accordionCard.find(".accordion-header [data-toggle='collapse']");

                //set valid filters
                Seeko.main.setAppliedFilters(this);

                //add form labels
                Seeko.main.addFormLabels(this);

                //create labels
                if (!$(this).hasClass('filter-search-input')) {
                    var accId = accordionCard.find(".accordion-header").attr("id");
                    var accContent = accordionHeader.html();
                    Seeko.main.createLabelFilter(accId, accContent, 1);
                } else {
                    if ($(this).val() !== '') {
                        Seeko.main.createLabelFilter('main-input', '<span class="chosen">' + $(this).val() + '</span>', 1);
                    } else {
                        $('[data-target="main-input"]').closest('li').remove();
                        Seeko.main.visibleLabelFilter--;
                        $('.label-remove-filters').removeClass("is-valid");
                    }
                }

                /* Remove filter when Selected option is blank */
                if ($(this).is('select')) {
                    if ($('option:selected', this).val() === '') {
                        Seeko.main.removeOneFilter(accordionCard.find('.accordion-remove-trigger'));
                        accordionHeader.find('span.chosen').remove();
                    }
                }
                /* Remove filter when no checkbox */
                if ($(this).is('input:checkbox')) {
                    if ($('[name="' + $(this).attr('name') + '"]:checked', accordionCard).length === 0) {
                        Seeko.main.removeOneFilter(accordionCard.find('.accordion-remove-trigger'));
                        accordionHeader.find('span.chosen').remove();
                    }
                }
                /* Remove filter when input is blank */
                if ($(this).is('input') && $(this).val() == '') {
                    Seeko.main.removeOneFilter(accordionCard.find('.accordion-remove-trigger'));
                }

                var context = $(this).closest('.filter-search-container');

                Seeko.main.doSearch(context);

                return false;

            });

            /* on keyup search */
            $('.filter-search-input').keyup(function (e) {
                var context = $(this).closest('.filter-search-container');
                clearTimeout($.data(this, 'timer'));
                var _this = $(this);

                if (Seeko.main.bpComponent !== null) {
                    Seeko.main.updateBpUrlParam(_this.val());
                    $('#' + Seeko.main.bpComponent + '_search').attr('placeholder', '').val(_this.val());
                }

                if (e.keyCode !== 13) {
                    $(this).data('timer', setTimeout(function () {
                        if (_this.val().length > 0 && _this.val().length < 3) {
                            //wasn't enter, not > 2 char
                            return;
                        }

                        Seeko.main.doSearch(context);

                    }, 500));
                }
            });

            /* On Load - set labels */
            $('select, ' + Seeko.main.inputs, Seeko.main.formClass).filter(function () {
                if ($(this).is('select')) {
                    if ($(this).find('option:selected').length > 0) {
                        return $(this).find('option:selected').val();
                    } else {
                        return false;
                    }
                } else if ($(this).is(':checkbox, :radio')) {
                    return $(this).is(':checked');
                }

                return this.value;
            }).each(function () {

                var accordionCard = $(this).closest(".accordion-card");
                var accordionHeader = accordionCard.find(".accordion-header [data-toggle='collapse']");

                //set valid filters
                Seeko.main.setAppliedFilters(this);

                //add form labels
                Seeko.main.addFormLabels(this);

                //create labels
                if (!$(this).hasClass('filter-search-input')) {
                    var accId = accordionCard.find(".accordion-header").attr("id");
                    var accContent = accordionHeader.html();
                    Seeko.main.createLabelFilter(accId, accContent, 1);
                } else {
                    Seeko.main.createLabelFilter('main-input', '<span class="chosen">' + $(this).val() + '</span>', 1);
                }

            });

            $(Seeko.main.formClass).on('submit', function (e) {
                e.preventDefault();

                Seeko.main.setFormCookie(Seeko.main.getFormValues(this), $('.sks-form-id', this).val(), this);

                Seeko.main.ajaxFilter(this);

                return false;
            });

            //on page load
            $(Seeko.main.formClass).each(function () {
                if ($(this).closest('.filter-search').hasClass('view-all')) {
                    Seeko.main.setViewLink($(this).find('.btn-filters.active'));
                }
            });
        },

        onResize: function () {
        },

        onClassicResize: function () {
            Seeko.main.resizeFilterSearch();
        },

        onScroll: function () {
        },

        updateBpUrlParam: function (value) {
            //Update members search URL
            if ('URLSearchParams' in window) {
                var searchParams = new URLSearchParams(window.location.search);
                if (value === '') {
                    searchParams.delete(Seeko.main.bpComponent + "_search");
                } else {
                    searchParams.set(Seeko.main.bpComponent + "_search", value);
                }

                var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
                history.pushState(null, '', newRelativePathQuery);
            }
        },

        removeBpSearchParam: function () {
            if (Seeko.main.bpComponent !== null) {
                Seeko.main.updateBpUrlParam('');
                $('#' + Seeko.main.bpComponent + '_search').val('');
                $('.filter-search-input').val('').trigger('change');
                Seeko.main.visibleLabelFilter--;

                return true;
            }
            return false;
        },

        doSearch: function (context) {
            Seeko.main.setFormCookie(Seeko.main.getFormValues(context), $('.sks-form-id', context).val(), context);

            Seeko.main.ajaxFilter(context);

            var resultsContext;

            if ($('.btn-filters.active').length > 0 ) {
                resultsContext = $(context).find('.btn-filters.active');
            } else {
                resultsContext = $(context);
            }

            Seeko.main.setViewLink(resultsContext);

            if (Seeko.main.bpComponent !== null) {
                $('.item-list-tabs #' + Seeko.main.bpComponent + '-all').addClass('selected');
                $('#search-' + Seeko.main.bpComponent + '-form #' + Seeko.main.bpComponent + '_search_submit').trigger('click');
            }
        },

        /* Set View all link depending on context */
        setViewLink: function (el) {
            var context, values, attr;

            attr = $('.context-url-class').first().val();

            if (el.length === 0) {
                context = $(el.context);
            } else {
                context = $(el).closest(Seeko.main.formClass);
                if ( $($(el).attr('href') + '-url').length > 0 ) {
                    attr = $($(el).attr('href') + '-url').val();
                }
            }

            values = Seeko.main.getFormValues(context, false, '.sks-filter-type');

            if (values != '') {
                attr += '?' + values;
            }
            $('.filters-footer-btn a', context).attr('href', attr);
        },

        getFormValues: function (context, security, except) {

            if (security === undefined) {
                security = true;
            }
            if (except === undefined) {
                except = '';
            }

            var values = [];
            var inputs = $('.tab-pane.show, .filter-search-collapsed .filter-search-row', context).find('input[name],select[name]');

            if (except !== '') {
                inputs = inputs.not(except);
            }

            inputs = inputs.filter(function () {
                return this.value;
            }).serialize();


            if (inputs != '') {
                values.push(inputs);
            }


            if ($('.filter-search-input', context).length > 0 && $('.filter-search-input', context).val() != '') {
                values.push('s=' + $('.filter-search-input', context).val());
            }

            if (security) {
                values.push('seeko_form_id=' + $('.sks-form-id', context).val());
                values.push('action=sks_filter&sks_security=' + $('#sks_security', context).val());
            }


            return values.join('&');
        },

        ajaxFilter: function (context) {

            if ($(context).closest('.filters-members-dir').length || $(context).closest('.filters-groups-dir').length) {
                return;
            }

            var values = Seeko.main.getFormValues(context);

            $('.suggestions-col .scroll-content', context).html('<p class="sks-spinner"></p>');

            Seeko.main.currentRequest = $.ajax({
                url: SeekoLocale.ajaxUrl,
                type: "POST",
                dataType: "json",
                data: values,
                beforeSend: function () {
                    if (Seeko.main.currentRequest !== null) {
                        Seeko.main.currentRequest.abort();
                    }
                },
                success: function (response) {
                    if (response === null) {
                        return;
                    }
                    var isContent = false;

                    if (response.data.hasOwnProperty('output') && !$.isEmptyObject(JSON.parse(response.data.output))) {
                        var contentData = JSON.parse(response.data.output);
                        var container = $('.suggestions-col .scroll-content', context);

                        container.html('');

                        $.each(contentData, function (k, v) {
                            if (v !== '') {
                                var dom_nodes = $($.parseHTML(v));

                                container.append(dom_nodes);
                                container.find('.media').addClass('seeko-el-appear');
                                if ($(context).closest('.filter-search').hasClass('show')) {
                                    container.seeko_general_onebyone();
                                }
                                isContent = true;
                            }
                        });
                    }

                    if (isContent === false) {
                        $('.suggestions-col .scroll-content', context).html('<p>' + SeekoLocale.noSuggestions + '</p>');
                    }

                },
                complete: function (data) {
                }
            });
        },

        resetForm: function (context) {
            console.log(context);
            $('input[type="radio"], input[type="checkbox"]', context).prop('checked', false);
            $('select', context).find('option:selected').prop('selected', false);
            $('input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=button]):not([type=submit]):not([type=reset])', context).val('');

            if (context.find('[data-trigger=true]').length) {
                context.find('[data-trigger=true]').next('a').find('.chosen').empty();
            }

            var formContext = $(context).closest('.filter-search-container');
            Seeko.main.setFormCookie(Seeko.main.getFormValues(formContext), $('.sks-form-id', formContext).val(), context);

            Seeko.main.ajaxFilter(formContext);

            var resultsContext;

            if ($('.btn-filters.active').length > 0 ) {
                resultsContext = $(formContext).find('.btn-filters.active');
            } else {
                resultsContext = $(formContext);
            }

            Seeko.main.setViewLink(resultsContext);

            if (Seeko.main.bpComponent !== null) {
                if ($(context).closest('.filters-' + Seeko.main.bpComponent + '-dir').length) {
                    if ($('.item-list-tabs').find('li.selected').length === 0) {
                        $('.item-list-tabs #' + Seeko.main.bpComponent + '-all').addClass('selected');
                    }
                    $('#search-' + Seeko.main.bpComponent + '-form #' + Seeko.main.bpComponent + '_search_submit').trigger('click');
                }
            }
        },

        removeAllFilters: function (self) {
            var filterSearch = $(self).closest(".filter-search");
            var tabPane = $(self).closest(".tab-pane.active");

            Seeko.main.resetForm(tabPane);

            tabPane.removeClass("selected-filters").removeAttr("data-filters");
            tabPane.find('.collapse.show').collapse('hide');
            tabPane.find(".accordion-card.is-valid").each(function () {
                $(this).find(".accordion-remove-trigger").attr("data-trigger", "false");
                $(this).removeClass("is-valid");
            });

            filterSearch.removeClass("selected-filters-xs");
            $('.label-applied-filters .is-valid').removeClass('is-valid');
            $('.label-remove-filters.is-valid').removeClass('is-valid');
            Seeko.main.visibleLabelFilter = 0;
        },

        removeOneFilter: function (context) {

            var self = $(context);

            var dataTrigger = self.attr("data-trigger");
            var accordionCard = self.closest(".accordion-card");
            var tabPane = self.closest(".tab-pane");
            var dataFilters = tabPane.attr("data-filters");

            if (dataTrigger == "true") {
                dataFilters--;

                if (dataFilters == 0) {
                    tabPane.removeClass("selected-filters");
                }
                Seeko.main.resetForm(accordionCard);

                tabPane.attr("data-filters", dataFilters);
                tabPane.find(".tab-applied-nr span").empty().append(dataFilters);
                accordionCard.removeClass("is-valid");
                self.attr("data-trigger", "false");

                var accheaderId = self.closest(".accordion-header").attr("id");
                $('.label-applied-filters [data-target="' + accheaderId + '"]').closest('.is-valid').removeClass('is-valid');
                Seeko.main.createLabelFilter(0);
            }

        },

        toggleSuggestionsFilters: function (filterSearch, area) {

            if (area === 'filters') {
                filterSearch.addClass("show-filters-xs view-all");

                if ($body.hasClass("device-xs") || $body.hasClass("device-sm")) {
                    if (filterSearch.hasClass('is-dark')) {
                        filterSearch.removeClass("enable-dark");
                    }
                    filterSearch.find(".close-filters").removeAttr("data-dismiss").attr("data-back", "true");
                }

            } else {
                if ($body.hasClass("device-xs") || $body.hasClass("device-sm")) {
                    filterSearch.addClass("enable-dark");
                    filterSearch.find(".close-filters").removeAttr("data-back").attr("data-dismiss", "modal");
                }

                filterSearch.removeClass("show-filters-xs view-all");
            }

        },

        resizeFilterSearch: function () {

            if (($body.hasClass("device-xs") || $body.hasClass("device-sm")) && $(".filter-search").hasClass("show-filters-xs")) {
                if ($(".filter-search").hasClass('is-dark')) {
                    $(".filter-search").removeClass("enable-dark");
                }
                $(".filter-search .close-filters").removeAttr("data-dismiss").attr("data-back", "true");

            } else if (($body.hasClass("device-md") || $body.hasClass("device-lg") || $body.hasClass("device-xl")) && $(".filter-search").hasClass("show-filters-xs")) {
                if ($(".filter-search").hasClass('is-dark')) {
                    $(".filter-search").addClass("enable-dark");
                }
                $(".filter-search .close-filters").removeAttr("data-back").attr("data-dismiss", "modal");
            }

            /*if ( $(".filter-search").hasClass("filter-search-side") ) {
                if (($body.hasClass("device-xs") || $body.hasClass("device-sm")) && $(".filter-search").hasClass("enable-dark")) {
                    if ($(".filter-search").hasClass('is-dark')) {
                        $(".filter-search").removeClass("enable-dark");
                    }

                } else if (($body.hasClass("device-md") || $body.hasClass("device-lg") || $body.hasClass("device-xl")) && !$(".filter-search").hasClass("enable-dark")) {
                    if ($(".filter-search").hasClass('is-dark')) {
                        $(".filter-search").addClass("enable-dark");
                    }
                }
            }*/

        },

        filterSearchSideOpen: function (self) {
            var thisTarget;
            if ($('body').hasClass('members')) {
                thisTarget = '#' + $('.filters-members-dir').attr("id");
            } else if ($('body').hasClass('groups')) {
                thisTarget = '#' + $('.filters-groups-dir').attr("id");
            }
            var trigger = $(self);

            if (!$(thisTarget).hasClass("show")) {
                $(thisTarget).removeClass("reverse-effect").addClass("show");
                $body.removeClass("reverse-effect").addClass("filter-search-side-open");

                trigger.closest(".filter-search-module").addClass("is-active");
                $(thisTarget).find(".filter-search-input").focus();
                trigger.addClass("is-active");

            } else {
                $(thisTarget).removeClass("show").addClass("reverse-effect");

                trigger.removeClass("is-active");
                $(".filter-search-module").removeClass("is-active");
                $body.removeClass("filter-search-side-open").addClass("reverse-effect");
                setTimeout(function () {
                    $body.removeClass('reverse-effect');
                }, 1500);
            }

            return false;
        },

        createLabelFilter: function (id, content, addremove) {

            var remove = $(".label-remove-filters");
            var where = $(".label-applied-filters .latest");
            var exist = $(".label-applied-filters [data-target=" + id + "]");

            if (id && content) {

                if (exist.length) {
                    exist.closest("li").addClass("is-valid");
                    exist.next('span').empty().append(content);

                } else {
                    $('<li class="is-valid"><div class="filter-tag"><a class="remove-existing-filters" data-target=' + id + '></a><span>' + content + '</span></div></li>').insertBefore(where);
                }
            }

            if (addremove) {
                Seeko.main.visibleLabelFilter++;
            } else {
                Seeko.main.visibleLabelFilter--;
            }

            if (Seeko.main.visibleLabelFilter > 1) {
                remove.addClass("is-valid");
            } else {
                remove.removeClass("is-valid");
            }
        },

        addFormLabels: function (el) {

            var chosenLabel = $(el).val();
            var accordionCard = $(el).closest(".accordion-card");
            var accordionHeader = accordionCard.find(".accordion-header [data-toggle='collapse']");

            //add selected value to accordion header
            if ($('input:checked', accordionCard).length > 1) {
                chosenLabel = $('input:checked', accordionCard).map(function () {
                    return $(this).val();
                }).get().join(', ');
            }
            //select values
            if ($('select', accordionCard).find('option:selected').length > 1) {
                chosenLabel = $('select', accordionCard).find('option:selected').map(function () {
                    return $(this).val();
                }).get().join(', ');
            }
            //input text values
            var valueInputs = $('input:not([type=checkbox]):not([type=radio])', accordionCard).filter(function () {
                return this.value;
            });
            if (valueInputs.length > 1) {
                chosenLabel = valueInputs.map(function () {
                    return $(this).val();
                }).get().join(' - ');
            }

            if (chosenLabel !== '') {
                if (accordionHeader.find('.chosen').length) {
                    accordionHeader.find('.chosen').html(chosenLabel);
                } else {
                    accordionHeader.append('<span class="chosen">' + chosenLabel + '</span>');
                }

            } else {
                accordionHeader.find('.chosen').remove();
            }
        },

        setAppliedFilters: function (el) {
            var dataFilters = 0;
            var accordionCard = $(el).closest(".accordion-card");
            var tabPane = $(el).closest(".tab-pane");

            if (!accordionCard.hasClass("is-valid")) {
                accordionCard.addClass("is-valid");
                accordionCard.find(".accordion-remove-trigger").attr("data-trigger", "true");

                if (tabPane.attr("data-filters")) {
                    dataFilters = tabPane.attr("data-filters");
                }
                dataFilters++;

                tabPane.addClass("selected-filters").attr("data-filters", dataFilters);
                tabPane.find(".tab-applied-nr span").empty().append(dataFilters);
            }
        },

        setFormCookie: function (data, formId, context) {

            /*if( ! $(context).closest('.seeko-form-section').hasClass('sks-persistent-form') ) {
                return;
            }*/

            var existing = Seeko.main.getCookie('seekoSearch');
            var obj = {};
            if (existing !== '') {
                try {
                    obj = JSON.parse(existing);
                } catch (e) {}
            }
            obj[formId] = data;
            Seeko.main.setCookie('seekoSearch', JSON.stringify(obj), 'https://seeko.seventhqueen.com/', 30);
        },

        setCookie: function (cname, cvalue, path, exdays) {
            if (typeof path === 'undefined') {
                path = 'https://seeko.seventhqueen.com/';
            }
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires + "; path=" + path;
        },
        getCookie: function (cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }
    };


    var $window = $(window),
        $body = $('body');

    $(document).ready(Seeko.main.init);
    $window.on('load', Seeko.main.onLoad);
    $window.on('debouncedresize', Seeko.main.onResize);
    $window.on('resize', Seeko.main.onClassicResize);
    $window.on('scroll', Seeko.main.onScroll);


    $.fn.seeko_general_onebyone = function (options) {
        return this.each(function () {
            var container = $(this), items = container.find('.seeko-el-appear');

            items.each(function (i) {
                var item = $(this);
                if (i === 0) {
                    item.addClass('seeko-start-anim');
                } else {
                    setTimeout(function () {
                        item.addClass('seeko-start-anim');
                    }, (i * 100));
                }
            });

        });
    };

})(jQuery);

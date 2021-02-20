/*
 * Read.js Library v0.1.1
 *
 * Copyright 2021 Bunoon
 * Released under the GNU AGPLv3 license
 */


/**
 * Attribute - data-read-more.
 * 
 * These are the properties that are set in the JSON/Object in the DOM element.
 *
 * @property    {boolean}   visible                                 A boolean flag that states if the element should be visible (in read more view).
 * @property    {boolean}   ignore                                  A boolean flag that states if the element should be ignored (false by default).
 * @property    {boolean}   useStyledContainer                      A boolean flag that states if the text detected should be placed inside a styled container (defaults to useStyledContainers option).
 * 
 */


/**
 * Options - Events.
 * 
 * These are the properties that store the events that should be fired when various actions are triggered.
 *
 * @property    {object}    onReadMore                              Specifies an event that will be triggered when the "Read More" link is pressed.
 * @property    {object}    onReadLess                              Specifies an event that will be triggered when the "Read Less" link is pressed.
 */


/**
 * Options.
 * 
 * These are the options that are used to control how Read.js works and renders.
 *
 * @property    {string}    readMoreText                            The text that should be used for the "Read More" link.
 * @property    {string}    readLessText                            The text that should be used for the "Read Less" link.
 * @property    {string}    ellipsisText                            The text that should be used for the "..." (ellipsis) text.
 * @property    {number}    maximumLengthOfText                     The maximum length text can be before they are converted into Read More views.
 * @property    {boolean}   useStyledContainers                     A boolean flag that states if the text detected in the elements should be placed inside a styled container (true by default).
 */


/**
 * readJs_Initialize().
 * 
 * A quick initializer for Read.js.
 * 
 * @param       {object}    options                                 All the configurable options that should be used (see Options documentation).
 * @param       {string}    containerID                             The element ID that contains your read more elements (defaults to the document body).
 * @param       {string}    elementTags                             The type of elements that should be looked up (defaults to everything).
 */
function readJs_Initialize( options, containerID, elementTags ) {
    return new readJs( options, containerID, elementTags );
}


/**
 * readJs().
 * 
 * The main Read.js class.
 * 
 * @param       {object}    options:                                All the configurable options that should be used (see Options documentation).
 * @param       {string}    containerID:                            The element ID that contains your read more elements (defaults to the document body).
 * @param       {string}    elementTags:                            The type of elements that should be looked up (defaults to everything).
 */
function readJs( options, containerID, elementTags ) {
    var _options = {},
        _elements = {},
        _elementTypes = {},
        _this = this,
        _document = null,
        _attributeName = "data-read-more",
        _capturedReadMores = {},
        _capturedReadLessName = "readLess",
        _capturedReadMoreName = "readMore";


    /*
     * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
     * Build & Display
     * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
     */

    function build( baseElementsContainer, baseElementContainerTagTypes ) {
        var elementTagTypes = baseElementContainerTagTypes.split( "," ),
            elementTagTypesLength = elementTagTypes.length,
            elementsContainer = !isDefined( baseElementsContainer ) ? _document.body : baseElementsContainer;

        for ( var elementTypeIndex = 0; elementTypeIndex < elementTagTypesLength; elementTypeIndex++ ) {
            var elementType = elementTagTypes[ elementTypeIndex ],
                elements = getElementsByTagName( elementsContainer, elementType ),
                elementsLength = elements.length;

            for ( var elementIndex = 0; elementIndex < elementsLength; elementIndex++ ) {
                var element = elements[ elementIndex ],
                    elementAttributeData = element.getAttribute( _attributeName );
    
                if ( elementAttributeData != null ) {
                    var elementAttributeJson = getAttributeObject( elementAttributeData ),
                        text = element.innerText;
    
                    if ( text.length > _options.maximumLengthOfText ) {
                        buildView( element, elementAttributeJson, text );
                    }
                }
            }
        }
    }

    function buildView( element, elementAttributeJson, text ) {
        if ( !isDefined( elementAttributeJson.ignore ) || !elementAttributeJson.ignore ) {
            var startText = text.substring( 0, _options.maximumLengthOfText ),
                endText = text.substring( _options.maximumLengthOfText ),
                useStyledContainer = isSettingTrue( elementAttributeJson, "useStyledContainer" ) || _options.useStyledContainers,
                newContainer = null,
                capturedReadMoreGuid = newGuid();

            element.innerText = "";
            element.innerHTML = "";
    
            if ( useStyledContainer ) {
                newContainer = createElement( "div" );
                newContainer.className = "rjs-text-container";
                element.appendChild( newContainer );
            } else {
                newContainer = element;
            }

            var newStartTextContainer = createElement( "span" );
            newStartTextContainer.innerHTML = startText;
            newContainer.appendChild( newStartTextContainer );
    
            var newEllipsisContainer = createElement( "span" );
            newEllipsisContainer.innerHTML = _options.ellipsisText;
            newContainer.appendChild( newEllipsisContainer );
    
            var newEndTextContainer = createElement( "span" );
            newEndTextContainer.style.display = "none";
            newEndTextContainer.innerHTML = endText;
            newContainer.appendChild( newEndTextContainer );
    
            var newReadMoreLink = createElement( "a" );
            newReadMoreLink.className = "rjs-read-more";
            newReadMoreLink.innerText = _options.readMoreText;
            newContainer.appendChild( newReadMoreLink );
    
            var readLess = function () {
                newEndTextContainer.style.display = "none";
                newEllipsisContainer.style.display = "inline";
                newReadMoreLink.innerText = _options.readMoreText;
                newReadMoreLink.className = "rjs-read-more";
            };
    
            var readMore = function () {
                newEndTextContainer.style.display = "inline";
                newEllipsisContainer.style.display = "none";
                newReadMoreLink.innerText = _options.readLessText;
                newReadMoreLink.className = "rjs-read-less";
            };

            _capturedReadMores[ capturedReadMoreGuid ] = {};
            _capturedReadMores[ capturedReadMoreGuid ][ _capturedReadLessName ] = readLess;
            _capturedReadMores[ capturedReadMoreGuid ][ _capturedReadMoreName ] = readMore;

            if ( isSettingTrue( elementAttributeJson, "visible" ) ) {
                readMore();
            }
    
            newReadMoreLink.addEventListener( "click", function () {
                if ( newEndTextContainer.style.display === "none" ) {
                    readMore();
                    triggerOptionsEvent( "onReadMore" );
                } else {
                    readLess();
                    triggerOptionsEvent( "onReadLess" );
                }
            });
        }
    }

    function triggerOptionsEvent( name ) {
        if ( _options !== null && isDefined( _options[ name ] ) && isFunction( _options[ name ] ) ) {
            _options[ name ]();
        }
    }

    function isSettingTrue( elementAttributeJson, setting ) {
        return isDefined( elementAttributeJson[ setting ] ) && elementAttributeJson[ setting ];
    }

    function newGuid() {
        var result = [];

        for ( var charIndex = 0; charIndex < 32; charIndex++ ) {
            if ( charIndex === 8 || charIndex === 12 || charIndex === 16 || charIndex === 20 ) {
                result.push( "-" );
            }

            var character = Math.floor( Math.random() * 16 ).toString( 16 );
            result.push( character );
        }

        return result.join( "" );
    }


    /*
     * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
     * Element Handling
     * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
     */

    function createElement( type ) {
        var result = null,
            nodeType = type == null ? "div" : type.toLowerCase(),
            isText = nodeType === "text";

        if ( !_elementTypes.hasOwnProperty( nodeType ) ) {
            _elementTypes[ nodeType ] = isText ? _document.createTextNode( "" ) : _document.createElement( nodeType );
        }

        result = _elementTypes[ nodeType ].cloneNode( false );

        return result;
    }

    function getElementByID( id ) {
        if ( !_elements.hasOwnProperty( id ) || _elements[ id ] === null ) {
            _elements[ id ] = _document.getElementById( id );
        }

        return _elements[ id ];
    }

    function getElementsByTagName( element, elementType ) {
        var elementsResult = [],
            elements = element.getElementsByTagName( elementType ),
            elementsLength = elements.length;

        for ( var elementIndex = 0; elementIndex < elementsLength; elementIndex++ ) {
            elementsResult.push( elements[ elementIndex ] );
        }

        return elementsResult;
    }

    function getAttributeObject( attributeData ) {
        var result = null;

        try {
            result = JSON.parse( attributeData );
        } catch ( e1 ) {

            try {
                result = eval( "(" + attributeData + ")" );
            } catch ( e2 ) {
                console.error( "Errors in attribute: " + e1.message + ", " + e2.message );
                result = null;
            }
        }

        return result;
    }


    /*
     * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
     * Validation
     * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
     */

    function isDefined( data ) {
        return data !== undefined && data !== null && data !== "";
    }

    function isFunction( object ) {
        return typeof object === "function";
    }


    /*
     * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
     * Public Functions
     * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
     */

    /**
     * setOptions().
     * 
     * Sets the options that should be used in Read.js.
     * 
     * @param       {object}    newOptions                              All the configurable options that should be used (see Options documentation).
     */
    this.setOptions = function ( newOptions ) {
        if ( newOptions !== null && typeof newOptions === "object" ) {
            _options = newOptions;
        } else {
            _options = {};
        }

        if ( !isDefined( _options.readMoreText ) ) {
            _options.readMoreText = "Read more";
        }

        if ( !isDefined( _options.readLessText ) ) {
            _options.readLessText = "Read less";
        }

        if ( !isDefined( _options.ellipsisText ) ) {
            _options.ellipsisText = "...";
        }

        if ( !isDefined( _options.maximumLengthOfText ) ) {
            _options.maximumLengthOfText = 200;
        }

        if ( !isDefined( _options.useStyledContainers ) ) {
            _options.useStyledContainers = true;
        }
    };

    /**
     * openAll().
     * 
     * Opens all the Read Mores detected.
     */
    this.openAll = function () {
        executeCapturedReadMoreEvent( _capturedReadMoreName );
    };

    /**
     * closeAll().
     * 
     * Closes all the Read Mores detected.
     */
    this.closeAll = function () {
        executeCapturedReadMoreEvent( _capturedReadLessName );
    };

    function executeCapturedReadMoreEvent( eventName ) {
        for ( var propertyName in _capturedReadMores ) {
            if ( _capturedReadMores.hasOwnProperty( propertyName ) ) {
                _capturedReadMores[ propertyName ][ eventName ]();
            }
        }
    }

    
    /*
     * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
     * Initialize Read.js
     * ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
     */

    ( function ( documentObject ) {
        options = !isDefined( options ) ? {} : options;

        _document = documentObject;

        var elementsContainer = isDefined( containerID ) ? getElementByID( containerID ) : null,
            elementTagTypes = isDefined( elementTags ) ? elementTags : "*";

        _this.setOptions( options );

        build( elementsContainer, elementTagTypes );

    } ) ( document );
}
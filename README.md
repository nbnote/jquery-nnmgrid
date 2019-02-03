# jQuery.nnmGrid

Diagonal grid layout plugin for jQuery


## Usage example


### HTML

    <ul id="container">
    <li class="item"><a href="#01"><img src="img/btn01.png" alt=""></a></li>
    <li class="item"><a href="#02"><img src="img/btn02.png" alt=""></a></li>
    <li class="item"><span><img src="img/btn03.png" alt=""></span></li>
    </ul>

### CSS
    #container {
      width: 630px;
    }

### JavaScript
    // DOM Ready
    jQuery(function($){
      var $container = $( '#container' ).nnmGrid({
        gap: 5
        isHover: 'is-hover'
        itemWidth: 150,
        itemHeight: 150,
        itemSelector: '.item',
        onHover: function(){},
        onClick: function(){}
      });
      
      // Update
      $container.width( $(window).width() );
      $container.nnmGrid( 'update' );
    });

## Demo

http://nbnote.github.io/jquery-nnmgrid/

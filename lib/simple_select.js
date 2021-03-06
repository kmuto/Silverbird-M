(function($) {
  const singletonHolder = new WeakMap();
  const selectElementHolder = new WeakMap();
  const visibleElementHolder = new WeakMap();

  $.fn.simpleSelect = function(options) {
    return this.each(function() {
      if(!singletonHolder.has(this)) {
        singletonHolder.set(this, new $.simpleSelect(this, options));
      }
      return singletonHolder.get(this);
    });
  };

  $.simpleSelect = function(selectEl, simpleSelectOptions) {
    if(selectEl.tagName !== "SELECT") {
      return;
    }
    if(visibleElementHolder.has(this)) {
      this.unbindEvents();
      visibleElementHolder.get(this).remove();
      visibleElementHolder.delete(this);
    }
    this.changeCallback = simpleSelectOptions.change;
    selectElementHolder.set(this, selectEl);
    selectEl.className = 'ss_overriden';
    // build html
    const options = Array.prototype.slice.call(selectEl.options);
    let optionAreaLists = ``;
    let visbleLabel = ``;
    for(let [index, option] of options.entries()) {
      let selected = "";
      if(index === selectEl.selectedIndex) {
        selected = ` class="selected"`;
        visibleLabel = `<span class="labelText">${option.text}</span>`;
      }
      optionAreaLists += `<li${selected}>${option.text}</li>`;
    }
    const visibleHtml = `
      <div class="simple_select">
        <span class="label">
          ${visibleLabel}
          <span class="material-icons dropdown">arrow_drop_down</span>
        </span>
        <div class="options_area">
          <ul>
            ${optionAreaLists}
          </ul>
        </div>
      </div>
    `;
    const $visibleHtml = $(visibleHtml);
    $visibleHtml.insertBefore(selectEl);
    requestIdleCallback(() => {
      visibleElementHolder.set(this, $visibleHtml);
      this.bindEvents();
    });
  };

  $.simpleSelect.prototype = {
    bindEvents: function() {
      const visibleEl = visibleElementHolder.get(this);
      const dropdown = visibleEl.find(".dropdown");
      const optionsArea = visibleEl.find(".options_area");
      optionsArea.find("li").on("click.simpleSelect", ((optionsArea) => {
        return (event) => {
          this.selectElement($(event.target).index(), true);
        };
      })(optionsArea));
      dropdown.on("click.simpleSelect", ((optionsArea) => {
        return (event) => {
          optionsArea.toggle();
        };
      })(optionsArea));
      $(document).on("click.simpleSelect", ((optionsArea, dropdown) => {
        return (event) => {
          if(event.target !== dropdown) {
            optionsArea.hide();
          }
        };
      })(optionsArea, dropdown[0]));
      $('.ui-tabs-nav li a').on("click.simpleSelect", ((optionsArea, label) => {
        return (event) => {
          if(event.target === label) {
            optionsArea.hide();
          }
        };
      })(optionsArea, visibleEl.find(".labelText")[0]));
    },

    unbindEvents: function() {
      const visibleEl = visibleElementHolder.get(this);
      const dropdown = visibleEl.find(".dropdown");
      const optionsArea = visibleEl.find(".options_area");
      optionsArea.find("li").off("click.simpleSelect");
      dropdown.off("click.simpleSelect");
      $(document).off("click.simpleSelect");
      $('.ui-tabs-nav li a').off("click.simpleSelect");
    },

    selectElement: function(index, generateEvent) {
      const selectEl = selectElementHolder.get(this);
      const visibleEl = visibleElementHolder.get(this);
      const optionsArea = visibleEl.find(".options_area");
      if(generateEvent && this.changeCallback) {
        const optionEl = selectEl.options[index];
        const shouldSelect = this.changeCallback(JSON.parse(unescape(optionEl.dataset.list)));
        if(!shouldSelect) {
          return;
        }
        optionsArea.toggle();
        optionsArea.find(".selected").removeAttr("class");
      }
      const liEl = optionsArea.find("li").eq(index);
      liEl.addClass("selected");
      selectEl.selectedIndex = index;
      visibleEl.find(".labelText").text(liEl.text());
    }
  };
})(jQuery);

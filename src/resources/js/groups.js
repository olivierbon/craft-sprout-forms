/*!
 * Manage our groups
 *
 * Based off the Craft fields.js file
 */

(function($) {

	var GroupsAdmin = Garnish.Base.extend({

		$groups: null,
		$selectedGroup: null,
		$groupSettingsBtn: null,

		init: function(settings)
		{
			// make settings globally available
			window.settings = settings;

			this.$groups = $(settings.groupsSelector);
			this.$selectedGroup = this.$groups.find('a.sel:first');
			this.addListener($(settings.newGroupButtonSelector), 'activate', 'addNewGroup');

			this.$groupSettingsBtn = $(settings.groupSettingsSelector);

			// Should we dispay the Groups Setting Selector or not?
			this.toggleGroupSettingsSelector();
			this.addListener(this.$groups, 'click', 'toggleGroupSettingsSelector');

			if (this.$groupSettingsBtn.length)
			{
				var menuBtn = this.$groupSettingsBtn.data('menubtn');

				menuBtn.settings.onOptionSelect = $.proxy(function(elem)
				{
					var action = $(elem).data('action');

					switch (action)
					{
						case 'rename':
						{
							this.renameSelectedGroup();
							break;
						}
						case 'delete':
						{
							this.deleteSelectedGroup();
							break;
						}
					}
				}, this);
			}
		},

		addNewGroup: function()
		{
			var name = this.promptForGroupName();

			if (name)
			{
				var data = {
					name: name
				};

				Craft.postActionRequest(settings.newGroupAction, data, $.proxy(function(response)
				{
					if (response.success)
					{
						location.href = Craft.getUrl(settings.newGroupOnSuccessUrlBase + response.group.id);
					}
					else
					{
						var errors = this.flattenErrors(response.errors);
						alert(settings.newGroupOnErrorMessage + "\n\n" + errors.join("\n"));
					}

				}, this));
			}
		},

		renameSelectedGroup: function()
		{
			this.$selectedGroup = this.$groups.find('a.sel:first');

			var oldName = this.$selectedGroup.text(),
			    newName = this.promptForGroupName(oldName);

			if (newName && newName != oldName)
			{
				var data = {
					id: this.$selectedGroup.data('id'),
					name: newName
				};

				Craft.postActionRequest(settings.renameGroupAction, data, $.proxy(function(response)
				{
					if (response.success)
					{
						this.$selectedGroup.text(response.group.name);
						Craft.cp.displayNotice(settings.renameGroupOnSuccessMessage);
					}
					else
					{
						var errors = this.flattenErrors(response.errors);
						alert(settings.renameGroupOnErrorMessage + "\n\n" + errors.join("\n"));
					}

				}, this));
			}
		},

		promptForGroupName: function(oldName)
		{
			return prompt(settings.promptForGroupNameMessage, oldName);
		},

		deleteSelectedGroup: function()
		{
			this.$selectedGroup = this.$groups.find('a.sel:first');
			if (confirm(settings.deleteGroupConfirmMessage))
			{
				var data = {
					id: this.$selectedGroup.data('id')
				};

				Craft.postActionRequest(settings.deleteGroupAction, data, $.proxy(function(response)
				{
					if (response.success)
					{
						location.href = Craft.getUrl(settings.deleteGroupOnSuccessUrl);
					}
					else
					{
						alert(settings.deleteGroupOnErrorMessage);
					}
				}, this));
			}
		},

		toggleGroupSettingsSelector: function()
		{
			this.$selectedGroup = this.$groups.find('a.sel:first');

			if (this.$selectedGroup.data('key') == '*')
			{
				$(this.$groupSettingsBtn).css('display', 'none');
			}
			else
			{
				$(this.$groupSettingsBtn).css('display', 'block');
			}
		},

		flattenErrors: function(responseErrors)
		{
			var errors = [];

			for (var attribute in responseErrors)
			{
				errors = errors.concat(response.errors[attribute]);
			}

			return errors;
		}
	});

// @TODO - How can we move this to the page?
	Garnish.$doc.ready(function()
	{
		Craft.GroupsAdmin = new GroupsAdmin({
			groupsSelector: '#sidebar nav ul',
			newGroupButtonSelector: '#newgroupbtn',
			groupSettingsSelector: '#groupsettingsbtn',

			newGroupAction: 'sprout-forms/groups/save-group',
			newGroupOnSuccessUrlBase: 'sprout-forms/forms/',
			newGroupOnErrorMessage: Craft.t('sprout-forms','Could not create the group:'),

			renameGroupAction: 'sprout-forms/groups/save-group',
			renameGroupOnSuccessMessage: Craft.t('sprout-forms','Group renamed.'),
			renameGroupOnErrorMessage: Craft.t('sprout-forms','Could not rename the group:'),

			promptForGroupNameMessage: Craft.t('sprout-forms','What do you want to name your group?'),

			deleteGroupConfirmMessage: Craft.t('app','Are you sure you want to delete this group and all its fields?'),
			deleteGroupAction: 'sprout-forms/groups/delete-group',
			deleteGroupOnSuccessUrl: 'sprout-forms/forms/',
			deleteGroupOnErrorMessage: Craft.t('sprout-forms','Could not delete the group.'),
		});
	});

})(jQuery);
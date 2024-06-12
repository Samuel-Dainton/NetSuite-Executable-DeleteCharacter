/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/record', 'N/search', 'N/log'],
    function (record, search, log) {
        function execute(context) {
            try {
                // Define the character to be removed
                var charToRemove = 'Â';

                // Create a search to find all item records
                var itemSearch = search.create({
                    type: search.Type.ITEM,
                    filters: [],
                    columns: ['displayname', 'purchasedescription', 'salesdescription', 'vendorname']
                });

                var itemSearchResults = itemSearch.run();
                var start = 0;
                var end = 1000;
                var results = itemSearchResults.getRange(start, end);

                while (results.length > 0) {
                    for (var i = 0; i < results.length; i++) {
                        var itemId = results[i].id;
                        var displayName = results[i].getValue({ name: 'displayname' });
                        var purchaseDescription = results[i].getValue({ name: 'purchasedescription' });
                        var salesDescription = results[i].getValue({ name: 'salesdescription' });
                        var vendorName = results[i].getValue({ name: 'vendorname' });

                        // Check and remove the character from each field
                        var updatedDisplayName = displayName ? displayName.replace(new RegExp(charToRemove, 'g'), '') : null;
                        var updatedPurchaseDescription = purchaseDescription ? purchaseDescription.replace(new RegExp(charToRemove, 'g'), '') : null;
                        var updatedSalesDescription = salesDescription ? salesDescription.replace(new RegExp(charToRemove, 'g'), '') : null;
                        var updatedVendorName = vendorName ? vendorName.replace(new RegExp(charToRemove, 'g'), '') : null;

                        // Load the item record
                        var itemRecord = record.load({
                            type: results[i].recordType,
                            id: itemId
                        });

                        var isModified = false;

                        // Update fields if they were changed
                        if (displayName !== updatedDisplayName) {
                            itemRecord.setValue({ fieldId: 'displayname', value: updatedDisplayName });
                            isModified = true;
                        }
                        if (purchaseDescription !== updatedPurchaseDescription) {
                            itemRecord.setValue({ fieldId: 'purchasedescription', value: updatedPurchaseDescription });
                            isModified = true;
                        }
                        if (salesDescription !== updatedSalesDescription) {
                            itemRecord.setValue({ fieldId: 'salesdescription', value: updatedSalesDescription });
                            isModified = true;
                        }
                        if (vendorName !== updatedVendorName) {
                            itemRecord.setValue({ fieldId: 'vendorname', value: updatedVendorName });
                            isModified = true;
                        }

                        // Save the item record if it was modified
                        if (isModified) {
                            itemRecord.save();
                        }
                    }

                    // Move to the next batch
                    start += 1000;
                    end += 1000;
                    results = itemSearchResults.getRange(start, end);
                }

                log.debug({
                    title: 'Script Execution Completed',
                    details: 'All items have been processed.'
                });

            } catch (e) {
                log.error({
                    title: 'Error occurred',
                    details: e.toString()
                });
            }
        }

        return {
            execute: execute
        };
    });

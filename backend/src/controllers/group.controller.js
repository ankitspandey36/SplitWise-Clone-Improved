import { Group } from "../model/group.model.js";
import { User } from "../model/user.model.js";
import { asyncHandler } from '../utils/asyncHandler.js'
import { apiError } from '../utils/apiError.js'
import { apiResponse } from '../utils/apiResponse.js'


const createGroup = asyncHandler(async (req, res) => {


    const user = req.user
    const { name } = req.body
    if (!name) {
        throw new apiError(400, "Group name is required");
    }
    const group = await Group.create({
        name,
        members: [user._id],
        createdBy: user._id
    })

    return res.status(200).json(new apiResponse(200, group, "Group Created Successfully."))
})

const addUserInGroup = asyncHandler(async (req, res) => {
    const { id } = req.body;
    console.log("this", id);

    if (!id) {
        throw new apiError(400, "Email is required");
    }
    const { groupId } = req.params
    const group = await Group.findById(groupId);
    if (!group) {
        throw new apiError(404, "Group not found");
    }
    const user = await User.findById(id);
    if (!user) {
        throw new apiError(404, "User with this id not found");
    }
    const already = group.members.some(
        memberId => memberId.toString() === user._id.toString()
    )
    if (already) {
        return res.status(400).json(new apiResponse(400, null, "User already in group"));
    }

    group.members.push(user._id);
    await group.save();
    return res.status(200).json(new apiResponse(200, null, "added in group sucessfully."))

})

const getGroupsForUser = asyncHandler(async (req, res) => {
    const user = req.user;
    const groups = await Group.find({ members: user._id });
    return res.status(200).json(new apiResponse(200, groups, "Groups fetched succesfully."))

})

const addExpenseInGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { paidBy, settleWith, note, amount, equal } = req.body;
    if (equal === undefined || equal === null) throw new apiError(400, "A valid selection is needed.");
    if (!paidBy || !settleWith || !note || !amount) throw new apiError(400, "Data is missing.");
    const group = await Group.findById(groupId);
    if (!group) throw new apiError(400, "Group not found.");

    const membersSet = new Set(group.members.map(m => m.toString()));
    const isPaidByMember = membersSet.has(paidBy.toString());
    const allSettleWithMembers = settleWith.every(userId => membersSet.has(userId.id.toString()));

    if (!isPaidByMember || !allSettleWithMembers) {
        throw new apiError(400, "All involved users must be members of the group.");
    }

    const isEqual = equal === true || equal === "true";
    let totalAmountNum = Number(amount);
    let remaining = totalAmountNum;

    if (isEqual) {
        const perPersonAmount = totalAmountNum / settleWith.length;
        const paidByInSettleWith = settleWith.some(userId => userId.id.toString() == paidBy.toString());
        if (paidByInSettleWith) {
            remaining -= perPersonAmount;
        }

        let newExpense = {
            paidBy,
            settleWith: settleWith.map(userId => ({
                settlers: userId.id,
                amount: Number(perPersonAmount)
            })),
            note,
            equal: isEqual,
            totalAmount: totalAmountNum,
            status: "notcleared",
            remaining,
            ...(paidByInSettleWith ? { clearedBy: [{ user: paidBy, when: Date.now(), amount: perPersonAmount }] } : {})
        };

        newExpense.settleWith = newExpense.settleWith.filter(m => m.settlers.toString() !== paidBy.toString());

        if (newExpense.settleWith.length === 0) {
            newExpense.status = "cleared"
        }

        group.expenses.push(newExpense);






    } else {
        const paidByInSettleWith = settleWith.some(userId => userId.id.toString() == paidBy.toString());

        let amt = settleWith.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const paidByObj = settleWith.find(userId => userId.id == paidBy);
        if (paidByObj) {
            amt -= Number(paidByObj.amount);
        }

        let newExpense = {
            paidBy,
            settleWith: settleWith.map(userId => ({
                settlers: userId.id,
                amount: Number(userId.amount)
            })),
            note,
            equal: isEqual,
            totalAmount: amt,
            remaining: amt,
            ...(paidByInSettleWith ? { clearedBy: [{ user: paidBy, when: Date.now(), amount: paidByObj.amount }] } : {})
        };

        newExpense.settleWith = newExpense.settleWith.filter(m => m.settlers.toString() !== paidBy.toString());
        if (newExpense.settleWith.length === 0) {
            newExpense.status = "cleared"
        }

        group.expenses.push(newExpense);

        group.expenses.push(newExpense);
    }

    await group.save();
    return res.status(200).json(new apiResponse(200, null, "Expense added successfully."));
});



const editExpenseInGroup = asyncHandler(async (req, res) => {
    const { amount, changeId } = req.body
    const { groupId, expenseId } = req.params
    console.log(changeId);

    const group = await Group.findById(groupId)
    if (!group) throw new apiError(400, "Group not found");
    const membersSet = new Set(group.members.map(m => m.toString()));

    if (!membersSet.has(req.user._id.toString())) {
        throw new apiError(400, "User is not in this group.")
    }
    const expense = group.expenses.id(expenseId);
    if (!expense) throw new apiError(404, "Expense not found");

    const isPayer = expense.paidBy.equals(req.user._id);
    const isInSettleWith = expense.settleWith.some(id => id.settlers.equals(req.user._id));

    if (!isPayer && !isInSettleWith) {
        return res.status(403).json(new apiResponse(403, null, "You are not authorized to edit this expense."));
    }

    if (expense.equal) {
        console.log("equal");

        const memberSize = group.members.length

        let oldAmount = expense.totalAmount / memberSize;
        let newAmount = amount / memberSize;
        console.log("old", oldAmount);
        console.log("new", newAmount);
        console.log("prevremaining", expense.remaining);

        if (oldAmount == newAmount) {
            return res.status(200).json(new apiResponse(200, null, "Settled Successfully"));
        }

        expense.totalAmount = Number(amount)
        expense.settleWith = expense.settleWith.map(m => ({ settlers: m.settlers, amount: newAmount }))
        const newRemaining = expense.clearedBy.map((m) => ({ settlers: m.user, amount: newAmount - oldAmount }))
        expense.settleWith = [...expense.settleWith, ...newRemaining];
        expense.clearedBy = []
        expense.remaining = expense.settleWith.reduce((acc, curr) => acc + curr.amount, 0);
        console.log("new remaining", expense.remaining);

        const paid = expense.settleWith.find((m) => m.settlers.toString() === expense.paidBy.toString());
        if (paid) {
            expense.remaining = Number(expense.remaining) - Number(paid.amount);
            console.log("ultranew", expense.remaining);
            expense.clearedBy.push({ user: paid.settlers, when: Date.now(), amount: newAmount })
            expense.settleWith = expense.settleWith.filter((m) => m.settlers.toString() !== expense.paidBy.toString())
        }
        await group.save();
        return res.status(200).json(new apiResponse(200, null, "Settled Successfully"));
    }
    else {
        const target = expense.settleWith.find(item =>
            item.settlers.equals(changeId)
        );
        if (target) {
            expense.remaining = Number(expense.remaining) - target.amount;
            target.amount = Number(amount);
            expense.remaining = Number(expense.remaining) + target.amount;

            if (target.amount == 0) {
                expense.clearedBy.push({ user: target.settlers, when: Date.now(), amount: target.amount });
                expense.settleWith = expense.settleWith.filter((m) => m.settlers.toString() !== target.settlers.toString());
            }

        }
        else {
            const isInClearBy = expense.clearedBy.find((s) => s.user.toString() === changeId.toString());
            if (!isInClearBy) throw new apiError(400, "User Not found");
            expense.settleWith.push({
                settlers: isInClearBy.user, when: Date.now(), amount: amount - isInClearBy.amount
            })
            expense.clearedBy = expense.clearedBy.filter((m) => m.user.toString() !== isInClearBy.user.toString());
        }
    }
    await group.save();
    return res.status(200).json(new apiResponse(200, null, "Expense Edited Succesfully."))
})

const settleExpenseInGroup = asyncHandler(async (req, res) => {
    const { groupId, expenseId } = req.params;
    const user = req.user;
    const group = await Group.findById(groupId);
    if (!group) throw new apiError(400, "Group not found");
    const membersSet = new Set(group.members.map(m => m.toString()));
    if (!membersSet.has(user._id.toString())) throw new apiError(400, "User is not a member of this group");
    const expense = group.expenses.id(expenseId);
    if (!expense) {
        throw new apiError(400, "No such expense exists");
    }
    if (!expense.paidBy.equals(req.user._id)) {
        throw new apiError(403, "Only users who paid this can settle this expenses.")
    }
    expense.remaining = 0;
    const peopleWhoNotCleared = group.members.filter((item) => !expense.clearedBy.some(mem => mem.user.toString() == item._id.toString()));
    peopleWhoNotCleared.forEach((member) => {
        const settleUser = expense.settleWith.find(s => s.settlers.toString() === member._id.toString());
        if (settleUser) {
            expense.clearedBy.push({ user: member._id, when: Date.now(), amount: settleUser.amount });
        }
    });

    expense.status = "cleared";
    await group.save();

    res.status(200).json(new apiResponse(200, null, "Expense settled"));

})



const deleteGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const user = req.user;
    const group = await Group.findById(groupId);
    if (!group) throw new apiError(400, "Group not exists");
    if (group.createdBy.toString() !== user._id.toString()) {
        throw new apiError(403, "You are not authorized to delete this group.");
    }

    await group.deleteOne();
    return res.status(200).json(new apiResponse(200, null, "Deleted successfully."));

})


const leaveGroup = asyncHandler(async (req, res) => {
    const user = req.user
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) {
        throw new apiError(404, "Group not found");
    }
    const membersSet = new Set(group.members.map(m => m.toString()));

    if (!membersSet.has(user._id.toString())) {
        throw new apiError(400, "You are not a member of this group.");
    }
    group.members = group.members.filter((member) => member.toString() != req.user._id.toString());
    if (user._id.toString() === group.createdBy.toString()) {
        if (group.members.length > 0) {
            const randomIndex = Math.floor(Math.random() * group.members.length);
            group.createdBy = group.members[randomIndex];
        } else {

            await group.deleteOne();
            return res.status(200).json(new apiResponse(200, null, "Left and deleted group as no members remained."));
        }
    }
    await group.save();
    return res.status(200).json(new apiResponse(200, null, "left group"));
})

const saveMessage = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { message } = req.body;
    if (!message || message.trim() == '') throw new apiError(400, "Message can't be empty.")
    const group = await Group.findById(groupId);
    if (!group) throw new apiError(400, "Group not found");
    const membersSet = new Set(group.members.map(m => m.toString()));

    if (!membersSet.has(req.user._id.toString())) {
        throw new apiError(400, "User is not in this group")
    }
    const msg = { sentBy: req.user._id, message };
    group.messages.push(msg);
    await group.save();
    return res.status(200).json(new apiResponse(200, null, "Message saved to Database"))
})

const getMessage = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
        throw new apiError(400, "Group not found");
    }

    const membersSet = new Set(group.members.map(m => m.toString()));
    if (!membersSet.has(req.user._id.toString())) {
        throw new apiError(403, "User is not a member of this group.");
    }

    const allMessages = group.messages;

    return res
        .status(200)
        .json(new apiResponse(200, allMessages, "All messages sent successfully."));
});

const getGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params
    const group = await Group.findById(groupId);
    if (!group) {
        throw new apiError(400, "Group not found")
    };
    const membersSet = new Set(group.members.map(m => m.toString()));

    if (!membersSet.has(req.user._id.toString())) {
        throw new apiError(400, "You are not a member of this group.")
    }
    return res.status(200).json(new apiResponse(200, group, "Group Fetched Succesfully."))
})

const getGroupExpense = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
        throw new apiError(400, "Group not found.");
    }

    const filteredExpenses = group.expenses
        .filter(exp => exp.status === "notcleared")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json(
        new apiResponse(200, filteredExpenses, "Expenses fetched successfully")
    );
});


const getGroupMembers = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const group = await Group.findById(groupId).populate("members", "email");
    if (!group) throw new apiError(400, "Group Not Found");
    return res.status(200).json(new apiResponse(200, group.members, "Group Members Returned"));
});


const getPeopleWhoClearedExpense = asyncHandler(async (req, res) => {
    const { groupId, expenseId } = req.params
    const group = await Group.findById(groupId);
    if (!group) throw new apiError(404, "Group Not Found");
    const expense = group.expenses.id(expenseId);
    if (!expense) throw new apiError(400, "No Such Expense Found.")
    return res.status(200).json(new apiResponse(200, expense.clearedBy, "Returned Successfully."))
})

const markAsPaid = asyncHandler(async (req, res) => {
    const { groupId, expenseId } = req.params;
    const { userId } = req.body;
    console.log(userId);

    const group = await Group.findById(groupId);
    if (!group) throw new apiError(404, "Group Not Found");
    if (!expenseId) throw new apiError(400, "Expense Id is not found.");
    const expense = group.expenses.id(expenseId);
    if (!expense) throw new apiError(400, "No Such Expense Found")
    const isAlreadyMarked = expense.clearedBy.find(s => s.user.toString() == userId.toString())
    if (isAlreadyMarked) throw new apiError(400, "User is already settled.");
    const user = expense.settleWith.find(s => s.settlers.toString() == userId.toString());
    if (!user) throw new apiError(400, "User is not in settle list.");
    expense.remaining = Number(expense.remaining) - Number(user.amount);
    if (expense.remaining < 0) expense.remaining = 0;
    expense.clearedBy.push({ user: userId, when: Date.now(), amount: user.amount });
    expense.settleWith = expense.settleWith.filter((m) => m.settlers.toString() !== userId.toString());
    if (expense.settleWith.length == 0) {
        expense.status = "cleared";
    }
    await group.save();
    return res.status(200).json(new apiResponse(200, null, "Succesfully marked as paid."));
})

const removeMemberFromExpense = asyncHandler(async (req, res) => {
    const { groupId, expenseId } = req.params;
    const { userId } = req.body;
    const group = await Group.findById(groupId);
    if (!group) throw new apiError(404, "Group Not Found");
    if (!expenseId) throw new apiError(400, "Expense Id is not found.");
    const expense = group.expenses.id(expenseId);
    if (!expense) throw new apiError(400, "No Such Expense Found");
    const user = expense.settleWith.find(s => s.settlers.toString() === userId.toString());
    if (!user) throw new apiError(400, "User is not in the settle list.");
    expense.settleWith = expense.settleWith.filter(s => s.settlers.toString() !== userId.toString());


    if (expense.settleWith.length === 0) {
        expense.remaining = 0;
        expense.totalAmount = 0;
        expense.status = "cleared";
        await group.save();
        return res.status(200).json(new apiResponse(200, null, "cleared successfully"));
    }

    if (expense.equal) {
        let oldAmount = expense.totalAmount / (expense.settleWith.length + expense.clearedBy.length + 1)
        let newAmount = expense.totalAmount / (expense.settleWith.length + expense.clearedBy.length);
        expense.remaining += (newAmount - oldAmount) * expense.clearedBy.length
        expense.settleWith = expense.settleWith.map(s => ({ settlers: s.settlers, amount: newAmount }))
        const newRemaining = expense.clearedBy.map(s => ({ settlers: s.user, amount: newAmount - oldAmount }))
        expense.settleWith = [...expense.settleWith, ...newRemaining]

    }
    else {

        expense.remaining = Math.max(0, expense.remaining - user.amount);

    }
    expense.clearedBy = expense.clearedBy.filter(c => c.user.toString() !== userId.toString());

    await group.save();
    return res.status(200).json(new apiResponse(200, null, "User Removed from Expense"));
})

const addANewMemberInExpense = asyncHandler(async (req, res) => {
    const { groupId, expenseId } = req.params;
    const { userId, amount } = req.body;

    if (!userId) throw new apiError(400, "User ID is required.");
    const group = await Group.findById(groupId);
    if (!group) throw new apiError(404, "Group Not Found");

    const expense = group.expenses.id(expenseId);
    if (!expense) throw new apiError(400, "No Such Expense Found");

    const isAlready = expense.settleWith.find(s => s.settlers.toString() === userId.toString())
        || expense.clearedBy.find(s => s.user.toString() === userId.toString());
    if (isAlready) throw new apiError(400, "User is already part of this expense.");

    const membersSet = new Set(group.members.map(m => m.toString()));
    if (!membersSet.has(userId.toString())) throw new apiError(400, "User is not in this group.");

    if (expense.equal) {
        const totalMembers = expense.settleWith.length + expense.clearedBy.length + 1;
        const newAmount = expense.totalAmount / totalMembers;

        expense.settleWith = expense.settleWith.map(s => ({
            settlers: s.settlers,
            amount: newAmount
        }));

        expense.settleWith.push({ settlers: userId, amount: newAmount });

        const newRemaining = expense.clearedBy.map(s => ({
            settlers: s.user,
            amount: newAmount - (expense.totalAmount / (totalMembers - 1))
        }));
        expense.settleWith = [...expense.settleWith, ...newRemaining];

        expense.remaining = newAmount * expense.settleWith.length;
        expense.clearedBy = [];
    } else {
        if (!amount) throw new apiError(400, "Amount is required for custom split expenses.");
        expense.settleWith.push({ settlers: userId, amount: Number(amount) });
        expense.totalAmount = Number(expense.totalAmount) + Number(amount);
        expense.remaining = Number(expense.remaining) + Number(amount);
    }

    await group.save();
    return res.status(200).json(new apiResponse(200, null, "User added to expense successfully."));
});

const getGroupIndividualExpense = asyncHandler(async (req, res) => {
    const { groupId, expenseId } = req.params;
    const group = await Group.findById(groupId).populate({
        path: 'expenses.settleWith.settlers',
        select: 'email'
    }).populate({
        path: 'expenses.paidBy',
        select: 'upid'
    });

    if (!group) throw new apiError(404, "Group Not Found");

    const expense = group.expenses.id(expenseId);
    console.log(expense);

    if (!expense) throw new apiError(400, "No Such Expense Found");

    return res.status(200).json(new apiResponse(200, expense, "Expense Fetched."))

})


const getGroupForActivity = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId })
        .sort({ createdAt: -1 })
        .populate("members", "email")
        .populate("expenses.paidBy", "email")
        .populate("expenses.settleWith.settlers", "email")
        .populate("expenses.clearedBy.user", "email")
        .lean();

    const filteredGroups = groups.map(group => {
        const userExpenses = group.expenses.filter(expense => {
            if (expense.paidBy && expense.paidBy._id.toString() === userId.toString()) {
                return true;
            }
            if (expense.settleWith.some(sw => sw.settlers?._id.toString() === userId.toString())) {
                return true;
            }
            return false;
        });

        return {
            ...group,
            expenses: userExpenses,
        };
    });

    res.status(200).json({
        success: true,
        data: filteredGroups
    });
})

export {
    createGroup, addUserInGroup, getGroupsForUser, addExpenseInGroup, editExpenseInGroup, settleExpenseInGroup, deleteGroup, leaveGroup, saveMessage, getMessage, getGroup, getGroupExpense, getGroupMembers, getPeopleWhoClearedExpense, markAsPaid, removeMemberFromExpense, addANewMemberInExpense, getGroupIndividualExpense, getGroupForActivity
}
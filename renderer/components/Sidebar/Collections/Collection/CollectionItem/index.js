import React, { useState, useRef, forwardRef } from 'react';
import get from 'lodash/get';
import range from 'lodash/range';
import classnames from 'classnames';
import { IconChevronRight, IconDots } from '@tabler/icons';
import { useSelector, useDispatch } from 'react-redux';
import { addTab, focusTab } from 'providers/ReduxStore/slices/tabs';
import { collectionFolderClicked } from 'providers/ReduxStore/slices/collections';
import Dropdown from 'components/Dropdown';
import NewRequest from 'components/Sidebar/NewRequest';
import RequestMethod from './RequestMethod';
import RenameCollectionItem from './RenameCollectionItem';
import DeleteCollectionItem from './DeleteCollectionItem';
import { isItemARequest, isItemAFolder, itemIsOpenedInTabs } from 'utils/tabs';

import StyledWrapper from './StyledWrapper';

const CollectionItem = ({item, collection}) => {
  const tabs = useSelector((state) => state.tabs.tabs);
  const activeTabUid = useSelector((state) => state.tabs.activeTabUid);
  const dispatch = useDispatch();

  const [renameItemModalOpen, setRenameItemModalOpen] = useState(false);
  const [deleteItemModalOpen, setDeleteItemModalOpen] = useState(false);
  const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);

  const dropdownTippyRef = useRef();
  const MenuIcon = forwardRef((props, ref) => {
    return (
      <div ref={ref}>
        <IconDots size={22}/>
      </div>
    );
  });

  const iconClassName = classnames({
    'rotate-90': item.collapsed
  });

  const itemRowClassName = classnames('flex collection-item-name items-center', {
    'item-focused-in-tab': item.uid == activeTabUid
  });

  const handleClick = (event) => {
    let tippyEl = get(dropdownTippyRef, 'current.reference');
    if(tippyEl && tippyEl.contains && tippyEl.contains(event.target)) {
      return;
    }

    if(event && event.target && event.target.className === 'dropdown-item') {
      return;
    }

    if(isItemARequest(item)) {
      if(itemIsOpenedInTabs(item, tabs)) {
        dispatch(focusTab({
          uid: item.uid
        }));
      } else {
        dispatch(addTab({
          uid: item.uid,
          collectionUid: collection.uid
        }));
      }
    } else {
      dispatch(collectionFolderClicked({
        itemUid: item.uid,
        collectionUid: collection.uid
      }));
    }
  };

  let indents = range(item.depth);
  const onDropdownCreate = (ref) => dropdownTippyRef.current = ref;
  const isFolder = isItemAFolder(item);

  return (
    <StyledWrapper className="flex flex-col">
      {renameItemModalOpen && <RenameCollectionItem item={item} collection={collection} onClose={() => setRenameItemModalOpen(false)}/>}
      {deleteItemModalOpen && <DeleteCollectionItem item={item} collection={collection} onClose={() => setDeleteItemModalOpen(false)}/>}
      {newRequestModalOpen && <NewRequest item={item} collection={collection} onClose={() => setNewRequestModalOpen(false)}/>}
      <div
        className={itemRowClassName}
        onClick={handleClick}
      >
        <div className="flex items-center h-full w-full">
          {indents && indents.length ? indents.map((i) => {
            return (
              <div
                className="indent-block"
                key={i}
                style = {{
                  width: 16,
                  height: '100%'
                }}
              >
                &nbsp;{/* Indent */}
              </div>
            );
          }) : null}
          <div
            className="flex items-center"
            style = {{
              paddingLeft: 8
            }}
          >
            <div style={{width:16}}>
              {isFolder ? (
                <IconChevronRight size={16} strokeWidth={2} className={iconClassName} style={{color: 'rgb(160 160 160)'}}/>
              ) : null}
            </div>
            
            <div className="ml-1 flex items-center">
              <RequestMethod item={item}/>
              <div>{item.name}</div>
            </div>
          </div>
          <div className="menu-icon pr-2">
            <Dropdown onCreate={onDropdownCreate} icon={<MenuIcon />} placement='bottom-start'>
              {isFolder && (
                <>
                  <div className="dropdown-item" onClick={(e) => {
                    dropdownTippyRef.current.hide();
                    setNewRequestModalOpen(true);
                  }}>
                    New Request
                  </div>
                  <div className="dropdown-item" onClick={(e) => {
                    dropdownTippyRef.current.hide();
                  }}>
                    New Folder
                  </div>
                </>
              )}
              <div className="dropdown-item" onClick={(e) => {
                dropdownTippyRef.current.hide();
                setRenameItemModalOpen(true);
              }}>
                Rename
              </div>
              <div className="dropdown-item delete-item" onClick={(e) => {
                dropdownTippyRef.current.hide();
                setDeleteItemModalOpen(true);
              }}>
                Delete
              </div>
            </Dropdown>
          </div>
        </div>
      </div>

      {item.collapsed ? (
        <div>
          {item.items && item.items.length ? item.items.map((i) => {
            return <CollectionItem
              key={i.uid}
              item={i}
              collection={collection}
            />
          }) : null}
        </div>
      ) : null}
    </StyledWrapper>
  );
};

export default CollectionItem;